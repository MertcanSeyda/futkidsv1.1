import { Controller, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tactic, TacticDocument } from '../tactics/schemas/tactic.schema';

@Controller('seed-tactics')
export class SeedTacticsController {
    constructor(@InjectModel(Tactic.name) private tacticModel: Model<TacticDocument>) { }

    @Post()
    async seed() {
        // Clear existing presets to ensure fresh data
        await this.tacticModel.deleteMany({ isPreset: true });

        // Helper to interpolate between two states
        const generateFrames = (startTokens: any[], endTokens: any[], durationMs: number, fps: number = 20): any[] => {
            const frameCount = (durationMs / 1000) * fps;
            const frames: any[] = [];

            for (let i = 0; i <= frameCount; i++) {
                const t = i / frameCount; // 0 to 1
                const currentTokens = startTokens.map(token => {
                    const endToken = endTokens.find(et => et.id === token.id) || token;
                    return {
                        ...token,
                        x: token.x + (endToken.x - token.x) * t,
                        y: token.y + (endToken.y - token.y) * t
                    };
                });
                frames.push({
                    tokens: currentTokens,
                    timestamp: i * (1000 / fps)
                });
            }
            return frames;
        };

        // Helper to chain multiple keyframes
        const createAnimation = (keyframes: any[][], stepDurationMs: number): any[] => {
            let allFrames: any[] = [];
            let currentTimestamp = 0;

            for (let i = 0; i < keyframes.length - 1; i++) {
                const segmentFrames = generateFrames(keyframes[i], keyframes[i + 1], stepDurationMs);
                // Adjust timestamps
                const adjustedFrames = segmentFrames.map(f => ({
                    ...f,
                    timestamp: f.timestamp + currentTimestamp
                }));

                if (i > 0) adjustedFrames.shift(); // Remove duplicate start frame of next segment

                allFrames = [...allFrames, ...adjustedFrames];
                currentTimestamp += stepDurationMs;
            }
            return allFrames;
        };

        // --- 5v2 Rondo Data (Centered) ---
        const rondoKeyframes = [
            [
                { id: 'h1', type: 'home', x: 250, y: 150, label: '1' }, { id: 'h2', type: 'home', x: 350, y: 150, label: '2' },
                { id: 'h3', type: 'home', x: 380, y: 200, label: '3' }, { id: 'h4', type: 'home', x: 300, y: 250, label: '4' },
                { id: 'h5', type: 'home', x: 220, y: 200, label: '5' },
                { id: 'a1', type: 'away', x: 280, y: 180, label: 'D1' }, { id: 'a2', type: 'away', x: 320, y: 220, label: 'D2' },
                { id: 'ball', type: 'ball', x: 260, y: 160 }
            ],
            [
                { id: 'h1', type: 'home', x: 250, y: 150, label: '1' }, { id: 'h2', type: 'home', x: 350, y: 150, label: '2' },
                { id: 'h3', type: 'home', x: 380, y: 200, label: '3' }, { id: 'h4', type: 'home', x: 300, y: 250, label: '4' },
                { id: 'h5', type: 'home', x: 220, y: 200, label: '5' },
                { id: 'a1', type: 'away', x: 320, y: 160, label: 'D1' }, { id: 'a2', type: 'away', x: 300, y: 190, label: 'D2' },
                { id: 'ball', type: 'ball', x: 340, y: 160 }
            ],
            [
                { id: 'h1', type: 'home', x: 250, y: 150, label: '1' }, { id: 'h2', type: 'home', x: 350, y: 150, label: '2' },
                { id: 'h3', type: 'home', x: 380, y: 200, label: '3' }, { id: 'h4', type: 'home', x: 300, y: 250, label: '4' },
                { id: 'h5', type: 'home', x: 220, y: 200, label: '5' },
                { id: 'a1', x: 350, y: 180, label: 'D1', type: 'away' }, { id: 'a2', x: 330, y: 220, label: 'D2', type: 'away' },
                { id: 'ball', type: 'ball', x: 370, y: 200 }
            ]
        ];

        // --- 1v1 Data (Attacking Right Goal at x=600) ---
        const oneVoneKeyframes = [
            [ // Build up
                { id: 'h1', type: 'home', x: 200, y: 200, label: 'FW' }, { id: 'a1', type: 'away', x: 400, y: 200, label: 'DF' }, { id: 'a2', type: 'away', x: 550, y: 200, label: 'GK' }, { id: 'ball', type: 'ball', x: 210, y: 200 }
            ],
            [ // Dribble to wing
                { id: 'h1', type: 'home', x: 350, y: 100, label: 'FW' }, { id: 'a1', type: 'away', x: 420, y: 150, label: 'DF' }, { id: 'a2', type: 'away', x: 550, y: 200, label: 'GK' }, { id: 'ball', type: 'ball', x: 360, y: 100 }
            ],
            [ // Cut inside
                { id: 'h1', type: 'home', x: 480, y: 180, label: 'FW' }, { id: 'a1', type: 'away', x: 460, y: 220, label: 'DF' }, { id: 'a2', type: 'away', x: 550, y: 200, label: 'GK' }, { id: 'ball', type: 'ball', x: 490, y: 180 }
            ],
            [ // Shot
                { id: 'h1', type: 'home', x: 490, y: 180, label: 'FW' }, { id: 'a1', type: 'away', x: 460, y: 220, label: 'DF' }, { id: 'a2', type: 'away', x: 530, y: 170, label: 'GK' }, { id: 'ball', type: 'ball', x: 580, y: 230 }
            ]
        ];

        const presets = [
            {
                name: '5v2 Rondo (Hareketli)',
                type: 'drill',
                isPreset: true,
                description: 'Ortada 5v2 top çevirme çalışması.',
                frames: createAnimation(rondoKeyframes, 1000)
            },
            {
                name: '1v1 Çalım & Şut',
                type: 'drill',
                isPreset: true,
                description: 'Kanattan merkeze kat edip kaleyi yoklama.',
                frames: createAnimation(oneVoneKeyframes, 1000)
            },
            {
                name: '7v7 Diziliş (2-3-1)',
                type: 'formation',
                isPreset: true,
                description: 'Modern 7 kişilik genç akademi dizilişi.',
                frames: [{
                    timestamp: 0,
                    tokens: [
                        { id: 'h1', type: 'home', x: 50, y: 200, label: 'GK' },
                        { id: 'h2', type: 'home', x: 150, y: 120, label: 'DF' },
                        { id: 'h3', type: 'home', x: 150, y: 280, label: 'DF' },
                        { id: 'h4', type: 'home', x: 300, y: 200, label: 'MF' },
                        { id: 'h5', type: 'home', x: 300, y: 80, label: 'MF' },
                        { id: 'h6', type: 'home', x: 300, y: 320, label: 'MF' },
                        { id: 'h7', type: 'home', x: 500, y: 200, label: 'FW' },
                        { id: 'ball', type: 'ball', x: 300, y: 200 }
                    ]
                }]
            },
            {
                name: 'Pas Üçgeni (Hareketli)',
                type: 'drill',
                isPreset: true,
                description: 'Üçgen formasyonunda tempo çalışması.',
                frames: createAnimation([
                    [{ id: 'h1', type: 'home', x: 200, y: 120, label: 'A' }, { id: 'h2', type: 'home', x: 400, y: 200, label: 'B' }, { id: 'h3', type: 'home', x: 200, y: 280, label: 'C' }, { id: 'ball', type: 'ball', x: 210, y: 130 }],
                    [{ id: 'h1', type: 'home', x: 200, y: 120, label: 'A' }, { id: 'h2', type: 'home', x: 400, y: 200, label: 'B' }, { id: 'h3', type: 'home', x: 200, y: 280, label: 'C' }, { id: 'ball', type: 'ball', x: 390, y: 200 }],
                    [{ id: 'h1', type: 'home', x: 200, y: 120, label: 'A' }, { id: 'h2', type: 'home', x: 400, y: 200, label: 'B' }, { id: 'h3', type: 'home', x: 200, y: 280, label: 'C' }, { id: 'ball', type: 'ball', x: 210, y: 270 }],
                    [{ id: 'h1', type: 'home', x: 200, y: 120, label: 'A' }, { id: 'h2', type: 'home', x: 400, y: 200, label: 'B' }, { id: 'h3', type: 'home', x: 200, y: 280, label: 'C' }, { id: 'ball', type: 'ball', x: 190, y: 130 }]
                ], 800)
            }
        ];

        await this.tacticModel.insertMany(presets);
        return { message: 'Presets updated with horizontal layout', count: presets.length };
    }
}
