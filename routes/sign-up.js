var express = require('express');
const {User} = require("../models/sign-up");
var router = express.Router();

router.post("/", (req, res) => {
  console.log(req.body);
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
})

module.exports = router;
