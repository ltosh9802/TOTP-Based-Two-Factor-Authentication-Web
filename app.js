//jshint esversion:6
import { authenticator, totp } from "otplib";

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

mongoose.connect(
  "mongodb+srv://toshik:toshik123@totpcluster-r77o1.mongodb.net/userDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const userSchema = {
  email: String,
  password: String,
  key: String
};

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.post("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login", { error: "" });
});
app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/logout", function(req, res) {
  res.redirect("/");
});

app.get("/success", function(req, res) {
  res.render("successlog");
});
app.post("/qrsuccess", function(req, res) {
  res.render("successreg");
});

app.get("/failed", function(req, res) {
  res.redirect("failed");
});

app.post("/register", function(req, res) {
  // var timestamp = Math.floor(Date.now() / 1000);
  // var pwdkey = "loginkey" + timestamp;
  var pwdkey = authenticator.generateSecret();
  console.log(pwdkey);
  // const secretk = pwdkey;
  const token = authenticator.generate(pwdkey);
  console.log(token);
 
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
    key: pwdkey
  });
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("genQR", { qrkey: pwdkey });
    }
  });
});

var logininputemail = null;
var logininputpwd = null;

var loginerror = null;

var timestamp = null;
var dbkey = null;

app.post("/login", function(req, res) {
  logininputemail = req.body.username;
  logininputpwd = req.body.password;

  User.findOne({ email: logininputemail }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === logininputpwd) {
          dbkey = foundUser.key;
          console.log(dbkey);

          res.render("enterkey");
        } else {
          res.render("failed");
        }
      } else {
        loginerror = "Email not found";
        res.render("login", { error: loginerror });
      }
    }
  });
});

app.post("/inputkey", function(req, res) {
  const keyentered = req.body.enterkey;
  User.findOne({ email: logininputemail }, function(err, foundUser) {
    const dbpin = authenticator.generate(dbkey);
    console.log(dbpin);
    
    //  const isValid = totp.check(token, pwdkey);
    //  console.log(isValid);

    if (dbpin === keyentered) {
      console.log("Successfuly login");
      res.render("successlog");
    } else {
      res.render("failed");
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
