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

exports.createDocs = (req, res, next) => {
  const docs = new Docs({
    docsFileName: req.file.filename,
    userId: req.userData.userId,
    docType: req.body.docType
  });
  docs
    .save()
    .then(createdDocs => {
      res.status(201).json({
        message: "Doc added successfully",
        post: {
          ...createdDocs,
          id: createdDocs._id
        }
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Creating a doc failed!"
      });
    });
};

exports.createTruckDocs = (req, res, next) => {
  Truck.findOneAndUpdate({ _id: req.body.truckId}, {$set: {TLic: req.files['TLIC'][0].filename, Lic: req.files['LIC'][0].filename, CMRLic: req.files['CMRLIC'][0].filename }}).then(createdDocs => {
    res.status(201).json(createdDocs);
  })
  .catch(error => {
    res.status(500).json({
      message: "Creating a doc failed!"
    });
  });
};

exports.sendPhoneCode = (req, res, next) => {
  var randomString = randomstring.generate(5);
  var phoneVerificationCode = new PhoneCode(
    { userId: req.userData.userId, phoneVerificationCode: randomString }
  );
  phoneVerificationCode.save().then(() => {
    client.messages
    .create({
      body: 'Your phone code is:' + randomString,
      from: '+16179413428',
      to: req.userData.dialCode + req.userData.telephone
    })
  }).then(result => {
    res.status(201).json({
      message: "Code sent",
      result: result
    });
  })
  .catch(err => {
    res.status(500).json({
      message: "DB error!"
    });
  });
}

exports.verifyPhoneCode = function (req, res, next) {
  PhoneCode.findOne({phoneVerificationCode: req.body.phoneCode}, function(err, phoneVerificationCode) {
    if(!phoneVerificationCode) {
      return res.status(400).send({ message: 'We were unable to find a valid token. Your token my have expired.' });
    }
    User.findOne({ _id: phoneVerificationCode._userId }, function(err, user) {
      if (!user) return res.status(400).send({ message: 'We were unable to find a user for this token.' });
      if (user.isTelephoneVerified) return res.status(400).send({ type: 'not-verified', message: 'This user has already been verified.' });
      user.isTelephoneVerified = true;
      user.save(function(err) {
        if(err) {
          { return res.status(500).send({ message: 'DB error!' }); }
        }
        else {
          res.status(201).json({
            message: "User updated!",
            result: user
          });
        }
      });
    });
  });
}

exports.inviteUser = (req, res, next) => {
  var inviteCode = randomstring.generate(30);
  const invitation = new Invitation({
    email: req.body.email,
    userId: req.userData.userId,
    inviteCode: inviteCode
  });
  invitation
  .save().then(()=> {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'nikola.balog@gmail.com', pass: '6hrhjJrhc8' }
    });
    var mailOptions = {
      from: 'no-reply@rasingo.com',
      to: req.body.email,
      subject: 'Rasingo Invitation',
      text: ' Tvoj poslovni partner ' + req.userData.companyName + 'poziva te na korištenje Rasingo platforme. Prvih 30 dana kompletno besplatno. Ne samo da je besplatno, već će i Vaš partner uživati u dodatnih, besplatnih mjesec dana, ukoliko postanete Rasingo korisnik. Pridruži te nam se, nećete požaliti. Nakon Vaše registracije, također možete pozvati svoje partnere koji još nisu korisnici Rasingo platforme te tako osigurati dodatne besplatne dane za Vaše osobno poslovanje. Klikni na:\n' +
       'http://localhost:4200/auth/signupStep0\/?inviteCode=' + inviteCode + '.\n'
    };
    transporter.sendMail(mailOptions)
  })
  .then(result => {
    res.status(201).json({
      message: "Invitation created!",
      result: result
    });
  })
  .catch(err => {
    res.status(500).json({
      message: "DB error!"
    });
  });
}

exports.editPassword = (req, res, next) => {
  User.findOne({ _id: req.userData.userId })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      return bcrypt.compare(req.body.oldPassword, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Wrong password"
        });
      } else {
        bcrypt.hash(req.body.newPassword, 10, function(err, hash) {
          User.findOneAndUpdate({_id: req.userData.userId}, {$set: {password: hash}}).then(result => {
            res.status(201).json({
              message: "User updated!",
              result: result
            });
          });
        });
      }
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid authentication credentials!"
      });
    });
}

exports.sendForgotCode = (req, res, next) => {
  User.findOne({email: req.body.email}, function(err, user) {
    console.log(user._id);
    var randomString = randomstring.generate(30);
    var passwordCode = new PasswordCode(
      { passwordVerificationCode: randomString,
        userId: user._id
      }
    );
    passwordCode.save().then(() => {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'nikola.balog@gmail.com', pass: '6hrhjJrhc8' }
      });
      var mailOptions = {
        from: 'no-reply@rasingo.com',
        to: req.body.email,
        subject: 'Change password link',
        text: 'Hello,\n\n' + 'Please click the link: \nhttp:\/\/' + 'localhost:4200' + '\/changeForgottenPassword\/?passwordVerificationCode=' + passwordCode.passwordVerificationCode + '.\n'
      };
      transporter.sendMail(mailOptions)
    }).then(result => {
      res.status(201).json({
        message: "Code sent",
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

exports.changeForgottenPassword = function (req, res, next) {
  console.log("ušel sam");
  PasswordCode.findOne({passwordVerificationCode: req.body.passwordVerificationCode}, function(err, passwordVerificationCode) {
    if(!passwordVerificationCode) {
      return res.status(400).send({ message: 'We were unable to find a valid token. Your token my have expired.' });
    } else {
      bcrypt.hash(req.body.newPassword, 10, function(err, hash) {
        User.findOneAndUpdate({_id: passwordVerificationCode.userId}, {$set: {password: hash}}).then(result => {
          res.status(201).json({
            message: "Password updated",
            result: result
          });
        }).catch(err => {
          res.status(500).json({
            message: "DB error!"
          });
        });
      });
    }
  });
}

exports.contact = (req, res, next) => {
  console.log("počeo");
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'nikola.balog@gmail.com', pass: '6hrhjJrhc8' }
  });
  var mailOptions = {
    from: 'no-reply@rasingo.com',
    to: 'nbdiekatze@hotmail.com',
    subject: 'Message from Rasingo form',
    text: 'Name:' + req.body.name + '\n\nEmail:' + req.body.email + '\n\nMesssage:\n' + req.body.message
  };
  transporter.sendMail(mailOptions).then(result => {
    res.status(201).json({
      message: "Mail sent",
      result: result
    });
  })
  .catch(err => {
    res.status(500).json({
      message: "Sending mail failed"
    });
  });
}


/*Admin*/
exports.getUsers = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const userQuery = User.aggregate([
    {
    $lookup: {
      from: Docs.collection.name,
      localField: "_id",
      foreignField: "userId",
      as: "user_docs"
    }
  },
  {
    $lookup: {
      from: Truck.collection.name,
      localField: "_id",
      foreignField: "userId",
      as: "user_trucks"
    }
  },
  { $sort : {regDate : -1 }}
  ]);
  let fetchedUsers;
  if (pageSize && currentPage) {
    userQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  userQuery
    .then(documents => {
      fetchedUsers = documents;
      return User.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Users fetched successfully!",
        users: fetchedUsers,
        maxUsers: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching users failed!"
      });
    });
};

exports.downloadFile = (req, res) => {
  const file = `backend/docs/${req.params.name}`;
  res.download(file);
}

exports.approve = (req, res, next) => {
  const user = new User({
    _id: req.params.id,
    approved: req.body.approved
  });
  User.updateOne({ _id: req.params.id}, user).then(result => {
    res.status(201).json({
      message: "User updated!",
      result: result
    });
  })
  .catch(err => {
    res.status(500).json({
      message: "DB error!"
    });
  });
}

exports.addNewsletterEmail = (req, res, next) => {
  console.log(req.body.email);
  const newsletter = new Newsletter({
    email: req.body.email,
    date: Date("YYYY-mm-dd")
  });
  newsletter.save().then(result => {
    res.status(201).json({
      message: "Email added",
      result: result
    });
  }).catch(err => {
    res.status(500).json({
      message: "DB error!"
    });
  });;
}
