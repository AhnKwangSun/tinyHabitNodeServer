var express = require('express');
var router = express.Router();
const {User} = require("../models/sign-up");
const url = require("url");

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
        res.status(200).json(responseValue);
    })
})

router.post("/google", (req, res) => {
    console.log("original", req.body);
    let data = req.body;
    data = data.token;
    data = JSON.parse(Buffer.from(data.split('.')[1], "base64").toString('utf8'));
    signInCheck(data, 'google', (responseValue) => {
        res.status(200).json(responseValue);
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
            searchUserId(callback, userData, 'appleId', 'thirdParty');
            break;
        case 'google':
            userData['googleId'] = data.sub;
            searchUserId(callback, userData, 'googleId', 'thirdParty');
            break;
        default:
            searchUserId(callback, data, 'userId');
            break;
    }
}

function searchUserId(callback, data, searchColumn, type) {
    let userFilter = {};
    let responseValue = {};
    let userData = {};

    if (type) {
        userFilter[searchColumn] = data.appleId;
    } else {
        userFilter[searchColumn] = data.userId;
    }

    User.findOne(userFilter, (err, user) => {
        console.log('gdgdgd', userFilter, err, user);
        if (!user) {
            if (type) {
                const user = new User(data);

                user.save((err, userInfo) => {
                    if (err) return callback(err)

                    responseValue['loginSuccess'] = 'true';
                    responseValue['token'] = 'jwtToken';
                    return callback(responseValue);
                });
            } else {
                console.log("2222",user);
                return ({
                    loginSuccess: false,
                    message: "존재하지 않는 아이디입니다.",
                });
            }
        } else {
            if (!type) {
                user
                    .comparePassword(req.body.passwd)
                    .generateToken()
                    .then((isMatch) => {
                        if (!isMatch) {
                            return ({
                                loginSuccess: false,
                                message: "비밀번호가 일치하지 않습니다",
                            });
                        }
                        return ({
                            loginSuccess: true,
                            token: 'jwtToken'
                        });
                    })
                    .catch((err) => err);
                //비밀번호가 일치하면 토큰을 생성한다
                //해야될것: jwt 토큰 생성하는 메소드 작성
            } else {

                user.generateToken()
                    .then((user) => {
                        responseValue['loginSuccess'] = 'true';
                        responseValue['token'] = user.token;
                        console.log('wawa2646',responseValue)
                        return callback(responseValue);
                    })
            }
        }
    });
}

module.exports = router;
