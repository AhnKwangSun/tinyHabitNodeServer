var express = require('express');
var router = express.Router();
const {User} = require("../models/sign-up");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('signIn', { title: 'LoginView' });
});

router.post("/", (req, res) =>{
  User.findOne({ userid: req.body.userid }, (err, user) => {
    if (err) {
      return res.json({
        loginSuccess: false,
        message: "존재하지 않는 아이디입니다.",
      });
    }
    user
        .comparePassword(req.body.passwd)
        .then((isMatch) => {
          if (!isMatch) {
            return res.json({
              loginSuccess: false,
              message: "비밀번호가 일치하지 않습니다",
            });
          }
          return res.json({
            loginSuccess: true,
            name: user.name,
          });
        })
        .catch((err) => res.json({ loginSuccess: false, err }));
    //비밀번호가 일치하면 토큰을 생성한다
    //해야될것: jwt 토큰 생성하는 메소드 작성
  });
})

module.exports = router;
