const express = require('express');
const passwordValidator=require('../middleware/password')
const router = express.Router();
const userCtrl = require('../controllers/user');

router.post("/signup", passwordValidator, userCtrl.signup)
router.post("/login", userCtrl.login)

module.exports = router;