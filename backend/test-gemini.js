const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Using Key:', apiKey);

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTry = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.0-pro'
    ];

    for (const m of modelsToTry) {
        try {
            console.log(`Trying ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent('hi');
            console.log(`SUCCESS with ${m}! Answer: ${result.response.text().substring(0, 20)}`);
            return;
        } catch (e) {
            console.log(`FAILED with ${m}: ${e.message}`);
        }
    }
}

listModels();
