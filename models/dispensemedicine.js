const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const Schema = mongoose.Schema;

const DispenseMedicineSchema = mongoose.Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient'
        //required: true
    },

    clinic: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic'
    },

    list: [{
        type: Schema.Types.ObjectId,
        ref: 'MedicineList'
    }]
   

    

});

const DispenseMedicine = module.exports = mongoose.model('DispenseMedicine', DispenseMedicineSchema);
