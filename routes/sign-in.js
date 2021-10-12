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

    console.log(signInCheck(data,'apple'));
    res.status(200).json({success:true});
})

router.post("/google", async (req, res) => {
    console.log("original", req.body);
    let data = req.body;
    data = data.token;
    data = JSON.parse(Buffer.from(data.split('.')[1], "base64").toString('utf8'));
    let responseValue
    responseValue = await signInCheck(data, 'google')
    console.log(responseValue);
    res.status(200).json(responseValue);
})
router.post("/", (req, res) =>{
  signInCheck(req.body).then(r => console.log(value));
})

async function signInCheck(data, type) {
    let value;

    switch (type) {
        case 'apple':
            value = await searchUserId(data, 'appleId', 'thirdParty');
            return value;
        case 'google':
            value = await searchUserId(data, 'googleId', 'thirdParty');
            return value;
        default:
            value = await searchUserId(data, 'userId');
            return value;
    }
}

async function searchUserId(data, searchColumn, type) {
    let userFilter = {};
    let responseValue = {};

    if (type) {
        userFilter[searchColumn] = data.sub;
    } else {
        userFilter[searchColumn] = data.userId;
    }

    await User.findOne(userFilter, (err, user) => {
        if (err) {
            if (type) {
                const user = new User(data);

                user.save((err, userInfo) => {
                    if (err) return res.json({success: false, err});
                    console.log('save1111', 'userInfo')
                    //return res.status(200).json({ success: true });
                });
            } else {
                return ({
                    loginSuccess: false,
                    message: "존재하지 않는 아이디입니다.",
                });
            }
        }

        if (!type) {
            user
                .comparePassword(req.body.passwd)
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
                .catch((err) => res.json({loginSuccess: false, err}));
            //비밀번호가 일치하면 토큰을 생성한다
            //해야될것: jwt 토큰 생성하는 메소드 작성
        } else {
            responseValue['loginSuccess'] = 'true';
            responseValue['token'] = 'jwtToken';
            console.log('wawa2646',responseValue)
            return responseValue;
        }
    });
}

module.exports = router;
