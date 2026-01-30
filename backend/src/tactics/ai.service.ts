import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
    constructor(private configService: ConfigService) { }

    async generateTacticFrames(prompt: string): Promise<any[]> {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        const p = prompt.toLowerCase();

        if (apiKey) {
            try {
                console.log('Gemini (v1 Endpoint) deneniyor...');
                // v1beta yerine v1 kullanarak en stabil endpoint'i zorluyoruz
                const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

                const systemPrompt = `Football coach. Create animation frames (JSON array). Board: 600x400. Teams: home (h1-h11), away (a1-a11), ball.`;
                const response = await axios.post(url, {
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }] }]
                }, { timeout: 10000 });

                const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    const jsonMatch = cleanedText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const data = JSON.parse(jsonMatch[0]);
                        return Array.isArray(data) ? data : (data.frames || data.data || []);
                    }
                }
            } catch (e: any) {
                console.warn('AI hala nazlaniyor, Akilli Senaryo Modu devreye giriyor...');
            }
        }

        // --- AKILLI SENARYO MODU (AI Olmadan AI Gibi) ---
        return this.generateSmartScenario(p);
    }

    private generateSmartScenario(p: string): any[] {
        const frames: any[] = [];
        const isRight = p.includes('sağ') || p.includes('right');
        const isLeft = p.includes('sol') || p.includes('left');
        const isShot = p.includes('şut') || p.includes('vursun') || p.includes('shoot');

        console.log(`Senaryo Hazirlaniyor: ${isRight ? 'Sag' : isLeft ? 'Sol' : 'Merkez'} Atak`);

        const startTokens = [
            { id: 'h1', type: 'home', x: 50, y: 200, label: 'GK' },
            { id: 'h10', type: 'home', x: 250, y: isLeft ? 100 : isRight ? 300 : 200, label: 'FW' },
            { id: 'ball', type: 'ball', x: 260, y: isLeft ? 105 : isRight ? 305 : 205 },
            { id: 'a1', type: 'away', x: 550, y: 200, label: 'GK' },
            { id: 'a3', type: 'away', x: 480, y: 200, label: 'DF' },
        ];

        for (let i = 0; i < 15; i++) {
            const t = i / 14;
            const currentTokens = startTokens.map(token => {
                if (token.id === 'h10') {
                    // Kaleye doğru kavisli koşu
                    const targetX = isShot && i > 10 ? 520 : 450;
                    return { ...token, x: token.x + (targetX - token.x) * t, y: token.y + (200 - token.y) * t };
                }
                if (token.id === 'ball') {
                    // Top forvetle gitsin, sonda şut çekilsin
                    const targetX = isShot && i > 10 ? 560 : 460;
                    const targetY = isShot && i > 12 ? 200 : (token.y + (200 - token.y) * t);
                    return { ...token, x: token.x + (targetX - token.x) * t, y: targetY };
                }
                if (token.id === 'a1' && isShot && i > 10) {
                    // Kaleci topa atlasın
                    return { ...token, y: token.y + (Math.random() > 0.5 ? 40 : -40) * (t) };
                }
                return token;
            });
            frames.push({ timestamp: i * 300, tokens: currentTokens });
        }
        return frames;
    }
}
