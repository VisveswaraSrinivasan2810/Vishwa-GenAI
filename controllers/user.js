const User = require("../models/User");
const bcrypt = require('bcryptjs');
const appError = require("../utils/appError");
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const {createToken} = require("../cookie/createToken");

//Register
const register = async (req,res,next)=>{
    const {userName,email,password} = req.body;
    try {
        if(!userName || !email || !password)
        {
           return next(appError('All fields are required',400));
        }
        //Check if the email already exists 
        const userExists = await User.findOne({email});
        if(userExists)
        {
          return next(appError('User already exists',400));
        }
        //Hash the password 
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hashSync(password,salt);

        //Create the new user
        const user = await User.create(
            {
                userName,
                email,
                password : hashPassword
            }
        );

        //Add the date when trial will end
        user.trialExpires = new Date(
            new Date().getTime() + user.trialPeriod*24*60*60*1000
        );

        //Resave the user
        await user.save();
        res.json(
            {
                 status : "Success",
                 data : {
                    user :
                    {
                        userName,
                        email
                    }
                 }
            }
        )
    } catch (error) {
        return next(appError(error));
    }
};
//Login
const login = async (req,res,next)=>{
    const {email,password} = req.body;
    try {
        if(!email || !password)
        {
            return next(appError('All fields are mandatory'));
        }
    const userFound = await User.findOne({email});
    
    if(!userFound)
    {
        return next(appError('Invalid credentials'));
    }
     //Compare the password
     const isValid = bcrypt.compareSync(password,userFound.password);
     if(!isValid)
     {
         return next(appError('Invalid credentials'));
     }
   
     //Generate the token
    //  const token = await jwt.sign({id : userFound._id},process.env.JWT_SECRET,{
    //     expiresIn : '3d'
    //  });

    const token = await createToken(userFound._id);
     

     //Set the token in the cookie
    const cookieString = cookie.serialize('jwtToken',token,{
        httpOnly :true,
        secure:false,
        sameSite :'strict',
        maxAge :24 * 60 * 60 * 1000
    });

    //Set the Cookie in the response header
    res.setHeader('Set-Cookie',cookieString);

    //Get the value from the header
 

        res.json(
            {
                status : "Success",
                data : userFound
            }
        )
    } catch (error) {
        return next(appError(error.message));
    }
};

//Logout
const logout = async (req,res)=>{
    try {
        res.clearCookie('jwtToken',
        {
            path : '/',
            domain : 'localhost',
            sameSite : 'strict',
            httpOnly:true,
            secure:false

        });
        res.json(
            {
                status : "Success",
                data : "Cookie Successfully Cleared"
            }
        )
    } catch (error) {
        res.json(error)
    }
};

//Profile
const profile = async (req,res,next)=>{
    // console.log(req.user);
    try {
        const user = await User.findById(req?.user).select('-password');
        if(!user)
        {
            return next(appError('User not found'));
        }
        res.json(
            {
                status : "Success",
                data : user
            }
        )
    } catch (error) {
        return next(appError(error.message));
    }
};
const test = async(req, res) => {
    console.log('Cookies:', req.cookies);
    res.send('Check the console for cookies');
  }

module.exports = {
    register,
    login,
    logout,
    profile,
    test
};

