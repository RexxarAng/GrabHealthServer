const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const MedicineListSchema = mongoose.Schema({
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
    },
    clinic: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    }

});

const MedicineList = module.exports = mongoose.model('MedicineList', MedicineListSchema);


module.exports.addMedicineList = function(newMedicine, callback) {
    newMedicine.save(callback);
}


MedicineListSchema.plugin(uniqueValidator, { message: "is already taken. "});
