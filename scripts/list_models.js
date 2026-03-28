const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const list = await genAI.getGenerativeModel({ model: "gemini-1.5-pro" }).listModels();
    console.log(JSON.stringify(list, null, 2));
  } catch (e) {
    // Some versions use this pattern
    try {
       const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
       const data = await response.json();
       console.log(JSON.stringify(data, null, 2));
    } catch (err) {
       console.error("Failed to list models:", err.message);
    }
  }
}

listModels();
