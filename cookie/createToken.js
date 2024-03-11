const jwt = require('jsonwebtoken');
require('dotenv').config();

const createToken = async (id) =>{
    const token = await jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn : '3d' //3 days
    });

    return token;
}

const verifyToken = async (token)=>{
    const decoded = await jwt.verify(token,process.env.JWT_SECRET);
    return decoded;
}
module.exports = {createToken,verifyToken};