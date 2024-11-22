const { Login } = require("../Controller/Logic");

const express = require("express");
const router = express.Router();

router.route("/login").post(Login);

module.exports = router;
