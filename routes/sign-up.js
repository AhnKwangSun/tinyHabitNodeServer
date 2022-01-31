var express = require('express');
const {User} = require("../models/sign-up");
var router = express.Router();

router.post("/check", (req,res)=>{
  let userFilter = {};
  let responseValue = {};

  userFilter['userId'] = req.body.userId;

  User.findOne(userFilter, (err,findUser) => {
    if(!findUser){
      responseValue['status'] = '200';
      responseValue['isDuplicate'] = false;
      return res.status(parseInt(responseValue.status)).json(responseValue);
    } else {
      responseValue['status'] = '200';
      responseValue['isDuplicate'] = true;
      return res.status(parseInt(responseValue.status)).json(responseValue);
    }
  })
})

router.post("/", (req, res) => {
  const user = new User(req.body);
  let userFilter = {};

  userFilter['userId'] = user.userId;

  User.findOne(userFilter,(err,findUser)=>{

    if(!findUser){
      user.save((err, userInfo) => {
        if (err) return res.status(500).json({status: 500, loginSuccess: false, err: err, errMsg : '회원가입 도중 에러가 발생했습니다.'});
        return res.status(200).json({status: 200, loginSuccess: true});
      })
    } else {
      return res.status(200).json({status: 200, errMsg: "userId duplicated"});
    }
  })

 })

module.exports = router;
