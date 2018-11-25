const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ReceptionistSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    ic: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

const Receptionist = module.exports = mongoose.model('Receptionist', ReceptionistSchema);

module.exports.getReceptionistById = function(id, callback) {
    Receptionist.findById(id, callback);
}

module.exports.getReceptionistByIc = function(ic, callback) {
    const query = {ic: ic};
    Receptionist.findOne(query, callback);
}

module.exports.addReceptionist = function(newReceptionist, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newReceptionist.password, salt, (err, hash) =>{
            if(err) throw err;
            newReceptionist.password = hash;
            newReceptionist.save(callback);
        });
    });
}