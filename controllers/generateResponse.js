const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser"); 
const User = require("../models/User");
const ContentHistory = require("../models/ContentHistory");
const { verifyToken } = require("../cookie/createToken");

dotenv.config();

// GoogleGenerativeAI required config
const configuration = new GoogleGenerativeAI(process.env.GEMINI_AIKEY);

// Model initialization
const modelId = "gemini-pro";
const generationConfig = {
  stopSequences: ["red"],
  maxOutputTokens: 300,
  temperature: 0.9,
  topP: 0.1,
  topK: 16,
};

const model = configuration.getGenerativeModel({
  model: modelId,
  generationConfig,
});

// const history = [];

const generateResponse = async (req, res) => {

  const {prompt} = req.body;
  try {
    const result = await model.generateContent(prompt);
   

    const content = result?.response.text();

    // const decoded = await verifyToken(req.cookies.jwtToken);
    // const userId = decoded.id;
    // console.log(userId);

    const user = await User.findById(req?.user);
    // Create the history 
    const newContent = await ContentHistory.create(
      {
        user:req?.user,
        content
      }
    )
     user.history.push(newContent._id);
    //  Update the API request count 
     user.apiRequestCount+=1;
    // resave the user
    await user.save();
    res.json({content});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  generateResponse,
};