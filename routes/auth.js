const express = require("express");
const passport = require("passport");
const authController = require("../controller/auth");
require("dotenv").config();

const authRouter = express.Router();

authRouter.post(
  "/signup",
  passport.authenticate("signup", { session: false }),
  authController.signup
);
authRouter.post("/login", authController.login);

module.exports = authRouter;
