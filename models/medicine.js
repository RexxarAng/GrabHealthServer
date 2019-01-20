const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const MedicineSchema = mongoose.Schema({
    name: {
        type: String
    },
    price: {
        type: Schema.Types.Double
    },
    category: {
        type: String
    },
    effects: {
        type: String
    },
    clinic:{
        type: Schema.Types.ObjectId,
        ref: 'Clinic'
    }

});

const Medicine = module.exports = mongoose.model('Medicine', MedicineSchema);

