const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require("../config/database");
const uniqueValidator = require('mongoose-unique-validator');

const BlackListSchema = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
});

const BlackList = module.exports = mongoose.model('BlackList', BlackListSchema);

module.exports.addToken = function(newBlackList, callback) {
    newBlackList.save(callback);
}

