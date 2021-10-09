const mongoose = require('mongoose');

// Define Schemes
const loginSchema = new mongoose.Schema({
        userid: { type: Number, required: true, unique: true },
        passwd: { type: String, required: true },
        login_dttm: { type: Date, default: true },
        duid: { type: String, default: false }
    },
    {
        timestamps: true
    });

let loginApi = mongoose.model('User',loginSchema);

let loginUser = new loginApi({
    userid
})

// Create Model & Export
module.exports = mongoose.model('login', loginSchema);