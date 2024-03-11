require('dotenv').config();
require('./config/dbConnect');
const express = require('express');
const userRoute = require('./routes/userRoute');
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const app = express();
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const stripeRoute = require('./routes/stripeRoute');
const User = require('./models/User');
const appError = require('./utils/appError');
const PORT = process.env.PORT || 7000;


//For trial
cron.schedule('0 0 * * * *',async (next)=>{
    try {
        const today = new Date();
         await User.updateMany({
            trialActive : true,
            trialExpires : {$lt : today}
        },
        {
            trialActive : false,
            subscriptionPlan : "Free",
            monthlyRequestCount : 5
        });
        
    } catch (error) {
        return next(appError(error.message));
    }
});

//Free Plan
cron.schedule('0 0 1 * * *',async (next)=>{
    try {
        const today = new Date();
         await User.updateMany({
            subscriptionPlan : "Free",
            nextBillingDate : {$lt : today}
        },
        {
            monthlyRequestCount : 0
        });
        
    } catch (error) {
        return next(appError(error.message));
    }
});
//Basic
cron.schedule('0 0 1 * * *',async (next)=>{
    try {
        const today = new Date();
         await User.updateMany({
            subscriptionPlan : "Basic",
            nextBillingDate : {$lt : today}

        },
        {
            monthlyRequestCount : 0
        });
        // console.log(updatedUser);
    } catch (error) {
        return next(appError(error.message));
    }
});
//Premium
cron.schedule('0 0 1 * * *',async (next)=>{
    try {
        const today = new Date();
        await User.updateMany({
            subscriptionPlan : "Premium",
            nextBillingDate : {$lt : today}
        },
        {
            monthlyRequestCount : 0
        });
        // console.log(updatedUser);
    } catch (error) {
        return next(appError(error.message));
    }
});


//Middlewares
app.use(express.json()); //Passing JSON data
app.use(cookieParser());

//Routes
app.use('/api/v1/users',userRoute);
app.use('/api/v1/users',stripeRoute);


//Error handler
app.use(globalErrorHandler);

//Listening server
app.listen(PORT,()=>{
    console.log(`Server is listening on the PORT ${PORT}`);
});


