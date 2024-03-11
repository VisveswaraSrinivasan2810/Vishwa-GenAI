const express = require('express');
const { register, login, logout, profile, test } = require('../controllers/user');
const { generateResponse } = require('../controllers/generateResponse');
const userRoute = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const checkAPIRequestLimit = require('../middlewares/checkAPIRequestLimit');



userRoute.post('/register',register);
userRoute.post('/login',login);
userRoute.post('/generate',isAuthenticated,checkAPIRequestLimit,generateResponse);
userRoute.post('/logout',logout);
userRoute.get('/profile',isAuthenticated,profile);
userRoute.get('/test',test);


module.exports = userRoute;