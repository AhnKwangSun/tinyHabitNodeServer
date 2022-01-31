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
    let data = req.body.token;
    signInCheck(data, 'apple', (responseValue) => {
        let status = parseInt(responseValue.status)
        delete responseValue['status']
        res.status(status).json(responseValue);
    })
})

router.post("/google", (req, res) => {
    let data = req.body;
    data = data.token;
    data = JSON.parse(Buffer.from(data.split('.')[1], "base64").toString('utf8'));
    signInCheck(data, 'google', (responseValue) => {
        let status = parseInt(responseValue.status)
        delete responseValue['status']
        res.status(status).json(responseValue);
    })
})
router.post("/", (req, res) =>{
  signInCheck(req.body,null,(responseValue) => {let status = parseInt(responseValue.status)
      delete responseValue['status']
      res.status(status).json(responseValue);
  })
})

function signInCheck(data, type, callback) {
    let value;
    let userData = {};

    switch (type) {
        case 'apple':
            userData['appleId'] = data;
            searchUserId(callback, userData, 'apple');
            break;
        case 'google':
            userData['googleId'] = data.sub;
            searchUserId(callback, userData, 'google',);
            break;
        default:
            searchUserId(callback, data);
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
                    if (err) {
                        responseValue['status'] = '200';
                        responseValue['code'] = 'CS0000';
                        responseValue['title'] = loginType + ' 로그인 오류';
                        responseValue['msg'] = '로그인 연동 오류';

                        return callback(responseValue)
                    }

                    const token = jwt.sign(userInfo._id.toHexString(), "secretToken");
                    responseValue['status'] = '200';
                    responseValue['loginSuccess'] = 'true';
                    responseValue['token'] = token;

                    return callback(responseValue);
                });
            } else {
                responseValue['status'] = '200';
                responseValue['code'] = 'CS0021';
                responseValue['title'] = '로그인 오류';
                responseValue['msg'] = '존재하지 않는 아이디입니다.';

                return callback(responseValue)
            }
        } else {
            if (!loginType) {
                user
                    .comparePassword(data.passwd)
                    .then((isMatch) => {
                        if (!isMatch) {
                            responseValue['status'] = '200';
                            responseValue['code'] = 'CS0022';
                            responseValue['title'] = '로그인 오류';
                            responseValue['msg'] = '비밀번호가 일치하지 않습니다.';

                            return callback(responseValue);
                        }

                        const token = jwt.sign(user._id.toHexString(), "secretToken");
                        responseValue['status'] = '200';
                        responseValue['loginSuccess'] = 'true';
                        responseValue['token'] = token;
                        return callback(responseValue);
                    })
                    .catch((err) => {
                        responseValue['status'] = '200';
                        responseValue['code'] = 'CS0000';
                        responseValue['title'] = '로그인 오류';
                        responseValue['msg'] = '유저 데이터를 불러오는데 실패했습니다.';

                        return callback(responseValue)
                    });
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
                    .catch((err) => {
                        responseValue['status'] = '200';
                        responseValue['code'] = 'CS0000';
                        responseValue['title'] = '로그인 오류';
                        responseValue['msg'] = 'JWT 토큰 생성에 실패했습니다.';

                        return callback(responseValue)
                    })
            }
        }
    });
}

module.exports = router;
