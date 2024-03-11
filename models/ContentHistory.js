const mongoose = require('mongoose');


//History Schema
const historySchema = new mongoose.Schema(
    {
        user : 
        {
            type : mongoose.Schema.Types.ObjectId,
            required : true
        },
        content : 
        {
            type : String,
            // required : true
        },
    },
    {
        timestamps : true
    }
);


//! Compile to form model
const ContentHistory = mongoose.model('ContentHistory',historySchema);

module.exports = ContentHistory;