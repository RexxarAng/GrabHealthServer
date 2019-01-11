const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const MedicineSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    price: {
        type: Schema.Types.Double
    },
    category: {
        type: String
    },
    effects: {
        type: String
    }

});

const Medicine = module.exports = mongoose.model('Medicine', MedicineSchema);
