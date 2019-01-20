const mongoose = require('mongoose');
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
