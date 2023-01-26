const express = require('express');
const passwordValidator=require('../middleware/password')
const emailValidator=require('../middleware/validateEmail')
const router = express.Router();
const userCtrl = require('../controllers/user');

router.post("/signup", emailValidator, passwordValidator, userCtrl.signup)
router.post("/login", userCtrl.login)

module.exports = router;