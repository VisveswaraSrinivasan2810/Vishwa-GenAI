// const jwt = require('jsonwebtoken');
const { verifyToken } = require('../cookie/createToken');
const appError = require('../utils/appError');

const isAuthenticated = async (req,res,next)=>{
    try {
        if(req.cookies.jwtToken)
    {
     //! Verify the token
     const decoded= await verifyToken(req.cookies.jwtToken);
    req.user=decoded.id;
    // console.log("Requested User in isAuth",req.user);
    
    // const decoded = jwt.verify(req.cookies.jwtToken,process.env.JWT_SECRET);
    // req.user=decoded.id;
    return next();
    }
    else
    {
        return res.status(401).json({message : 'Not Authorized No Token'});
    }
    } catch (error) {
        return next(appError(error.message));
    }
    

};

module.exports = isAuthenticated;
