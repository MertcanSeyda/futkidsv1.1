const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function diagnose() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Teşhis başlatılıyor...');
    console.log('Kullanılan Anahtar:', apiKey);

    // Google SDK bazen v1beta kullanır, bazen v1. 
    // Anahtarın hangi sürüme izin verdiğini anlamaya çalışalım.
    const genAI = new GoogleGenerativeAI(apiKey);

    const testModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

    for (const modelName of testModels) {
        try {
            console.log(`\n--- ${modelName} Deneniyor ---`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Merhaba, orada mısın?');
            const response = await result.response;
            console.log(`BAŞARILI! Cevap: ${response.text().substring(0, 30)}...`);
            return; // Bir tanesi çalıştıysa yeter
        } catch (error) {
            console.error(`${modelName} HATASI:`);
            if (error.message.includes('404')) {
                console.error('-> Model bulunamadı (404). Muhtemelen bölge veya anahtar kısıtlaması.');
            } else if (error.message.includes('401') || error.message.includes('not valid')) {
                console.error('-> ANAHTAR GEÇERSİZ (401). Anahtarı yanlış kopyalamış olabiliriz.');
            } else {
                console.error('-> Beklenmedik Hata:', error.message);
            }
        }
    }
    console.log('\nMaalesef hiçbir modelle bağlantı kurulamadı.');
}

diagnose();
