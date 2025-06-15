const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();

const signup = (req, res) => {
  try {
    const { _id, email } = req.user;
    res.status(201).json({
      message: "Signup successful",
      user: {
        id: _id,
        email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(401)
          .json({ error: "Email or password is incorrect" });
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        return res.status(200).json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

module.exports = {
  signup,
  login,
};
