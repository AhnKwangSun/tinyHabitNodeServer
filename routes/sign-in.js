var express = require('express');
var router = express.Router();
const {User} = require("../models/sign-up");
const url = require("url");
const jwt = require("jsonwebtoken");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('signIn', { title: 'LoginView' });
});

router.get('/apple', function(req, res, next) {
    res.render('signIn', { title: 'AppleLoginView' });
});

router.get('/google', function(req, res, next) {
    res.render('signIn', { title: 'GoogleLoginView' });
});
router.post("/apple", (req, res) =>{
    let data = req.body;
    data = data.token;
    data = JSON.parse(Buffer.from(data.split('.')[1], "base64").toString('utf8'));

    signInCheck(data, 'apple', (responseValue) => {
        res.status(parseInt(responseValue.status)).json(responseValue);
    })
})

router.post("/google", (req, res) => {
    let data = req.body;
    data = data.token;
    data = JSON.parse(Buffer.from(data.split('.')[1], "base64").toString('utf8'));
    signInCheck(data, 'google', (responseValue) => {
        res.status(parseInt(responseValue.status)).json(responseValue);
    })
})
router.post("/", (req, res) =>{
  signInCheck(req.body).then(r => console.log(value));
})

function signInCheck(data, type, callback) {
    let value;
    let userData = {};

    switch (type) {
        case 'apple':
            userData['appleId'] = data.sub;
            searchUserId(callback, userData, 'apple');
            break;
        case 'google':
            userData['googleId'] = data.sub;
            searchUserId(callback, userData, 'google',);
            break;
        default:
            searchUserId(callback, data, 'userId');
            break;
    }
}

function searchUserId(callback, data, loginType) {
    let userFilter = {};
    let responseValue = {};
    let userData = {};

    if (loginType==='apple') {
        userFilter['appleId'] = data.appleId;
    } else if (loginType==='google') {
        userFilter['googleId'] = data.googleId;
    } else {
        userFilter['userId'] = data.userId;
    }

    User.findOne(userFilter, (err,user) => {
        if (!user) {
            if (loginType) {
                const user = new User(data);

                user.save((err, userInfo) => {
                    if (err) return callback(err)
                    const token = jwt.sign(userInfo._id.toHexString(), "secretToken");
                    responseValue['status'] = '200';
                    responseValue['loginSuccess'] = 'true';
                    responseValue['token'] = token;

                    return callback(responseValue);
                });
            } else {
                return ({
                    loginSuccess: false,
                    message: "존재하지 않는 아이디입니다.",
                });
            }
        } else {
            if (!loginType) {
                user
                    .comparePassword(req.body.passwd)
                    .generateToken()
                    .then((isMatch) => {
                        if (!isMatch) {
                            responseValue['status'] = '400';
                            responseValue['loginSuccess'] = 'false';
                            responseValue['token'] = user.token;

                            return callback(responseValue);
                        }


                        user.generateToken()
                            .then((user) => {
                                responseValue['status'] = '200';
                                responseValue['loginSuccess'] = 'true';
                                responseValue['token'] = user.token;
                                return callback(responseValue);
                            })
                    })
                    .catch((err) => err);
                //비밀번호가 일치하면 토큰을 생성한다
                //해야될것: jwt 토큰 생성하는 메소드 작성
            } else {

                user.generateToken()
                    .then((user) => {
                        responseValue['status'] = '200';
                        responseValue['loginSuccess'] = 'true';
                        responseValue['token'] = user.token;
                        return callback(responseValue);
                    })
            }
        }
    });
}

module.exports = router;
