const mongoose = require('mongoose');


//User Schema
const userSchema = new mongoose.Schema(
    {
        userName : 
        {
            type : String,
            required : true
        },
        email : 
        {
            type : String,
            required : true
        },
        password :
        {
            type : String,
            required : true
        },
        trialActive :
        {
            type : Boolean,
            default : true
        },
        trialPeriod : {
            type : Number,
            default : 3 //3 Days
        },
        trialExpires :
        {
            type : Date
        },
        subscriptionPlan :
        {
            type : String,
            enum : ['Trial','Basic','Free','Premium']
        },
        apiRequestCount :
        {
            type : Number,
            default : 0
        },
        monthlyRequestCount : 
        {
            type : Number,
            default : 100
        },
        nextBillingDate :{
            type : Date
        },
        payments : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Payment'
            }
        ],
        history : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'History'
            }
        ]
    },
    {
        timestamps : true,
        toObject : {virtuals : true},
        toJSON : {virtuals : true}
      
    }
);

//! Add a Virtual property
// userSchema.virtual('isTrialActive').get(function (){
//     return this.trialActive && new Date() < this.trialExpires;
// });
//! Compile to form model
const User = mongoose.model('User',userSchema);

module.exports = User;