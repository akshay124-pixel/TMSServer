const { Signup } = require("../Controller/Logic");

const express = require("express");
const router = express.Router();

router.route("/signup").post(Signup);

module.exports = router;
