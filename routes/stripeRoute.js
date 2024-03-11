const express = require('express');
const stripeRoute = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const {handleStripePayment, handleFreeSubscription, verifyPayment} = require('../controllers/handleStripePayment');


stripeRoute.post('/checkOut',isAuthenticated,handleStripePayment);
stripeRoute.post('/free-plan',isAuthenticated,handleFreeSubscription);
stripeRoute.post('/verify/:paymentId',isAuthenticated,verifyPayment);



module.exports=stripeRoute;