const express = require("express");
const router = express.Router();
// User model
const User = require("../models/user");
// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const ensureLogin = require("connect-ensure-login");
const passport = require("passport");

router.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("passport/private", { user: req.user });
});

router.get("/signup", (req, res) => {
  res.render("passport/signup");
});

router.post("/signup", (req, res) => {
  const { username, password } = req.body;

  var fieldsPromise = new Promise((resolve, reject) => {
    if (username === "" || password === "") {
      reject(new Error("Indicate a username and a password to sign up"));
    } else {
      resolve();
    }
  });

  fieldsPromise
    .then(() => {
      return User.findOne({ username });
    })
    .then(user => {
      if (user) {
        throw new Error("The username already exists");
      }

      // Hash the password
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass
      });

      return newUser.save();
    })
    .then(user => {
      res.redirect("/");
    })
    .catch(err => {
      res.render("passport/signup", {
        errorMessage: err.message
      });
    });
});

router.get("/login", (req, res) => {
  res.render("passport/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

router.get('/logout' , (req,res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
