const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

// Define Schemes
const signUpSchema = new mongoose.Schema({
        userId:       { type: String },
        googleId:       { type: String},
        appleId:       { type: String },
        passwd:     { type: String, trim:true },
        nickName:       { type: String },
        // login_dttm: { type: Date, default: true },
        // prfl_img:   { type: String },
        // duid:       { type: String, default: false },
        // token:      { type: String },
        // tokenExp:   { type: Number },
    },
    {
        timestamps: true
    });

signUpSchema.pre("save", function (next) {
    let user = this;
    console.log('save',user)

    if (user.isModified("passwd")) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.passwd, salt, function (err, hash) {
                if (err) return next(err);
                user.passwd = hash;
                next();
            });
        });
    } else {
        next();
    }
});

signUpSchema.methods.compareUserId = function (plainUserId) {
    return this.userId === plainUserId ? true : false;
};

signUpSchema.methods.comparePassword = function (plainPassword) {
    return bcrypt
        .compare(plainPassword, this.passwd)
        .then((isMatch) => isMatch)
        .catch((err) => err);
};

signUpSchema.methods.generateToken = function () {
    this.token = jwt.sign(this._id.toHexString(), "secretToken");
    return this.save()
        .then((user) => user)
        .catch((err) => err);
};


const User = mongoose.model("User", signUpSchema);

// Create Model & Export
module.exports = { User }
