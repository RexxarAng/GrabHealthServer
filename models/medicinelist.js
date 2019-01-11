const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

const Schema = mongoose.Schema;

const MedicineListSchema = mongoose.Schema({
    clinic: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    list:[{
        type: Schema.Types.ObjectId,
        ref: 'Medicine'
    }]

});

const MedicineList = module.exports = mongoose.model('MedicineList', MedicineListSchema);


module.exports.addMedicineList = function(newMedicine, callback) {
    newMedicine.save(callback);
}


