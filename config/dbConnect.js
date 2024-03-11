const mongoose = require('mongoose');


const dbConnect = async () =>{
    try {
         await mongoose.connect(process.env.MONGO_URL);
         console.log('DB has been successfully created');
    } catch (error) {
        console.error(error);
    }
};

dbConnect();