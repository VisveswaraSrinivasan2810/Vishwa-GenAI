const Payment = require('../models/Payment');
const User = require('../models/User');
const appError = require('../utils/appError');
const calculateNextBillingDate = require('../utils/calculateNextBillingDate');
const shouldRenewSubscriptionPlan = require('../utils/shouldRenewSubscriptionPlan');

const stripe = require('stripe')(process.env.STRIPE_SECRET);

const handleStripePayment = async(req,res,next)=>{
    const {amount,subscriptionPlan} = req.body;
    try {
        // console.log('req.user:', req.user);
        const user = await User.findById(req?.user);
        // console.log('foundUser:', user);
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency:'inr',
            metadata : {
                userId : user._id.toString(),
                userEmail:user?.email.toString(),
                subscriptionPlan
            }
        }
        );
        // console.log(paymentIntent);
        res.json({
            clientSecret:paymentIntent.client_secret,
            paymentId:paymentIntent?.id,
            metaData:paymentIntent?.metadata
        });
    } catch (error) {
        return next(appError(error.message));
    }
};

//! Verify the payment 
const verifyPayment = async (req,res,next)=>{
    const {paymentId}=req.params;
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        // console.log(paymentIntent);
        if(paymentIntent.status !== "succeeded")
        {
            const metadata = paymentIntent?.metadata;
            // console.log(metadata);
            const subscriptionPlan = metadata?.subscriptionPlan;
            const userEmail = metadata?.userEmail;
            const userId = metadata?.userId;
            const userFound = await User.findById(userId);
            if(!userFound){
                return next(appError("User not found"));
            }
            const amount = paymentIntent.amount;
            const currency = paymentIntent.currency;
            const paymentId = paymentIntent.id;

            const newPayment = await Payment.create(
                {
                    user : userId,
                    email : userEmail,
                    subscriptionPlan,
                    amount,
                    currency,
                    status:"success",
                    reference : paymentId
                }
            )
            if(subscriptionPlan === "Basic")
            {
                const updateUser = await User.findByIdAndUpdate(userId,{
                    subscriptionPlan,
                    trialPeriod : 0,
                    nextBillingDate : calculateNextBillingDate(),
                    apiRequestCount : 0,
                    monthlyRequestCount : 50,
                    $addToSet : {payments : newPayment._id}
                });
                res.json({
                    status : "Success",
                    message : "Payment verified successfully",
                    updateUser
                })
            }
            if(subscriptionPlan === "Premium")
            {
                const updateUser = await User.findByIdAndUpdate(userId,{
                    subscriptionPlan,
                    trialPeriod : 0,
                    nextBillingDate : calculateNextBillingDate(),
                    apiRequestCount : 0,
                    monthlyRequestCount : 500,
                    $addToSet : {payments : newPayment._id}
                });
                res.json({
                    status : "Success",
                    message : "Payment verified successfully",
                    updateUser
                })
            }
        
        }
    } catch (error) {
        return next(appError(error.message));
    }
}

//! Handle Free Subscription
const handleFreeSubscription = async(req,res,next)=>{
   
    try {
        const user= await User.findById(req?.user);
        console.log(user);
        if(shouldRenewSubscriptionPlan(user))
        {
             //Update the user account
             user.subscriptionPlan = "Free";
             user.monthlyRequestCount=5;
             user.apiRequestCount=0;
             user.nextBillingDate=calculateNextBillingDate();


              //Create a new payment
             const newPayment = await Payment.create(
                {
                    user : user._id,
                    subscriptionPlan : "Free",
                    amount : 0,
                    status : "success",
                    reference : Math.random().toString(36).substring(7),
                    monthlyRequestCount : 5,
                    currency : 'inr'
                }
            );

            //Push the payment into the user
            user.payments.push(newPayment?._id);
             //resave the user
             await user.save();
             return res.json({
                message : "Subscription Plan Updated successfully",
                user
             })
        }
        else
        {
            return next(appError("Subscription renewal not due yet"));
        }
      
    
       



    } catch (error) {
        return next(appError(error.message));
    }
}
module.exports = {handleStripePayment,
handleFreeSubscription,verifyPayment};