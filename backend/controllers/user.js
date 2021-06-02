const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const randomstring = require("randomstring");
const EmailVerificationCode = require("../models/email-code");
const User = require("../models/user");

exports.createUser = (req, res, next) => {
  console.log("tu");
  bcrypt.hash(req.body.password, 10).then(hash => {
    console.log("u dodavanju");
    const user = new User({
      email: req.body.email,
      password: hash,
      regDate: Date.now(),
      isEmailVerified: false
    });
    console.log("tu");
    user
      .save().then(()=> {
        console.log("prošlo dodavanje");
      var randomString = randomstring.generate(30);
      var emailVerificationCode = new EmailVerificationCode(
        { userId: user._id, emailVerificationCode: randomString }
      );
      emailVerificationCode.save(() => {
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user:'' /*Your gmail email*/, pass:'' /*Your gmail password*/ }
        });
        var mailOptions = {
          from: 'no-reply@rasingo.com',
          to: user.email,
          subject: 'Account Verification Code',
          text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/api/user/confirmation\/?emailVerificationCode=' + emailVerificationCode.emailVerificationCode + '.\n'
        };
        transporter.sendMail(mailOptions)
      });
    })
    .then(result => {
      res.status(201).json({
        message: "User created!",
        result: result
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "DB error!"
      });
    });
  });
}

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Wrong password"
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id, dialCode: fetchedUser.dialCode, telephone: fetchedUser.telephone, companyName: fetchedUser.companyName },
        process.env.JWT_KEY
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      });
    });
}

exports.confirmationPost = function (req, res, next) {
  EmailVerificationCode.findOne({emailVerificationCode: req.query.emailVerificationCode}, function(err, emailVerificationCode) {
    if(!emailVerificationCode) {
      return res.status(400).send({ message: 'We were unable to find a valid token. Your token my have expired.' });
    }
    User.findOne({ _id: emailVerificationCode.userId }, function(err, user) {
      if (!user) return res.status(400).send({ message: 'We were unable to find a user for this token.' });
      if (user.isEmailVerified) return res.status(400).send({ type: 'not-verified', message: 'This user has already been verified.' });
      user.isEmailVerified = true;
      user.save(function(err) {
        if(err) {
          { return res.status(500).send({ message: 'DB error!' }); }
        }
        res.redirect('http://localhost:4200/auth/login/?&verifyMessage=true');
      });
    });
  });
}

exports.getUserData = function (req, res, next) {
  User.findById(req.params.id)
    .then(user => {
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching user failed"
      });
    });
}
