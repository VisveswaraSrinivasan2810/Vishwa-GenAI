const User = require("../models/User");
const appError = require("../utils/appError");

const checkAPIRequestLimit = async (req,res,next) =>{
    try {
       if(!req?.user)
       {
        return next(appError("Not Authorized"));
       }  
       //find the user
       const user = await User.findById(req?.user);
       if(!user)
       {
        return next(appError("User not found"));
       }
       let requestLimit = 0;
       //Check the user is in trial period
       if(user?.trialActive)
       {
        requestLimit = user?.monthlyRequestCount
       }
       //Checek if the api limit exceeds
       if(user?.apiRequestCount >= requestLimit)
       {
        return next(appError("API request limit reached ,Please Subscribe to a plan"));
       }

        return next();
    } catch (error) {
        return next(appError(error.message));
    }
 
};

module.exports=checkAPIRequestLimit;