const Sauce = require("../models/sauce.model");
const fs = require("fs");
const { updateOne } = require("../models/sauce.model");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const defaultValue = {
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  };
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    ...defaultValue,
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Sauce enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()

    .then((sauces) => {
      res.status(200).json(sauces);
    })

    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })

    .then((sauce) => res.status(200).json(sauce))

    .catch((error) => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  console.log(req.file);
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) throw error;
        });
      })
      .catch((error) => res.status(404).json({ error }));
  }

  const userObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : {
        ...req.body,
      };

  Sauce.updateOne({ _id: req.params.id }, { ...userObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.likeSauce = (req, res, next) => {

  
  // vérifier si l'utilisateur n'a pas déjà donner un avis
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
       
        // MAJ de la base de donnée

        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { usersLiked: req.body.userId },
          }
        )
          .then(() => {
            res.status(201).json({ message: " Vous avez aimez !" });
          })
          .catch((error) => res.status(400).json({ error }));

      }  if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1 ){

        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
          }
        )
          .then(() => {
            res.status(201).json({ message: " Vous n'avez pas aimez !" });
          })
          .catch((error) => res.status(400).json({ error }));

      }  if(sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0){

        Sauce.updateOne(

          { _id: req.params.id },
          {
            $inc: { dislikes: -1 },
            $pull:{usersDisliked: req.body.userId}
          }
        )
        .then(() => {
          res.status(201).json({ message: " Vous avez retirer votre dislike !" });
        })
        .catch((error) => res.status(400).json({ error }));

      } if(sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {

        Sauce.updateOne(

          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull:{usersLiked: req.body.userId}
          }
        )
        .then(() => {
          res.status(201).json({ message: " Vous avez retirer votre like !" });
        })
        .catch((error) => res.status(400).json({ error }));


      }
    })
    .catch((error) => res.status(404).json({ error }));
};
