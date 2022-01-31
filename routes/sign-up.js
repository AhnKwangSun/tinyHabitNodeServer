var express = require('express');
const {User} = require("../models/sign-up");
const {response} = require("express");
var router = express.Router();

router.post("/check", (req,res)=>{
  let userFilter = {};
  let responseValue = {};
  let lengthCheck = /^.{8,20}$/     //모든 글자 8글자이상 20글자 이하

  userFilter['userId'] = req.body.userId;

  if(!lengthCheck.test(req.body.userId)){
    responseValue['code'] = 'CS0002';
    responseValue['title'] = '회원가입 오류';
    responseValue['msg'] = 'ID 길이 오류';
    return res.status(200).json(responseValue);
  } else {

    User.findOne(userFilter, (err,findUser) => {
      if(!findUser){
        responseValue['isDuplicate'] = false;
        return res.status(200).json(responseValue);
      } else {
        responseValue['code'] = 'CS0001';
        responseValue['title'] = '회원가입 오류';
        responseValue['msg'] = 'ID 중복 오류';
        responseValue['isDuplicate'] = true;
        return res.status(200).json(responseValue);
      }
    })
  }


})

router.post("/", (req, res) => {
  const user = new User(req.body);
  let userFilter = {};
  let responseValue = {};
  let passwdCheck = /(?=.*\d)(?=.*[a-zㄱ-ㅎ]).{8}/     //숫자 문자 포함 8글자이상

  if(!passwdCheck.test(user.passwd)){
    responseValue['code'] = 'CS0003';
    responseValue['title'] = '회원가입 오류';
    responseValue['msg'] = '패스워드 형식 오류';
    return res.status(200).json(responseValue);
  }

  userFilter['userId'] = user.userId;

  User.findOne(userFilter,(err,findUser)=>{

    if(!findUser){
      user.save((err, userInfo) => {
        if (err) {
          return res.status(200).json({code: 'CS0000', title: '회원가입 오류', msg : '회원가입 도중 에러가 발생했습니다.'});
        } else {
          return res.status(200).json({loginSuccess: true});
        }
      })
    } else {
      return res.status(200).json({code: 'CS0001', title: '회원가입 오류', msg : 'ID 중복 오류'});
    }
  })

 })

module.exports = router;
