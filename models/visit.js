const mongoose = require('mongoose');
const config = require("../config/database");
require('mongoose-double')(mongoose);
const Schema = mongoose.Schema;

const VisitSchema = mongoose.Schema({
     patient: {
         type: Schema.Types.ObjectId,
         ref: 'Patient'
         //required: true
     },
    
    reasonForVisit: {
        type: String,
        required: true
    }

  

    

});

const Visit = module.exports = mongoose.model('Visit', VisitSchema);
module.exports.addReasonForVisit = function (reasonForVisit, callback) {
    reasonForVisit.save(callback);
}