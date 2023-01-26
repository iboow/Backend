const validator = require("validator");

module.exports = (req, res, next) => {
  const email = req.body.email;

  if (validator.isEmail(email)) {
    console.log("Mail valide");
    next();
  } else {
    return res.status(400).json({ message: "Adresse invalide" });
  }
};
