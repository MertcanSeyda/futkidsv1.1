import React, { useState, useRef, useEffect } from "react";
import { Eraser, Pen, MousePointer2, RefreshCcw, Save, Play, Square, Circle, RotateCcw, X, Trash2, FolderOpen, Sparkles } from "lucide-react";
import api from "@/lib/api";

interface Token {
    id: string;
    type: 'home' | 'away' | 'ball';
    x: number;
    y: number;
    label?: string;
}

interface Frame {
    tokens: Token[];
    timestamp: number;
}

export default function TacticsBoard() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<'move' | 'draw' | 'erase'>('move');
    const [color, setColor] = useState('#ffffff');
    const [tokens, setTokens] = useState<Token[]>([
        { id: 'h1', type: 'home', x: 250, y: 150, label: '1' },
        { id: 'h2', type: 'home', x: 300, y: 100, label: '2' },
        { id: 'h3', type: 'home', x: 300, y: 200, label: '3' },
        { id: 'h4', type: 'home', x: 200, y: 250, label: '4' },
        { id: 'h5', type: 'home', x: 100, y: 150, label: 'GK' },
        { id: 'b1', type: 'ball', x: 250, y: 150 },
        { id: 'a1', type: 'away', x: 350, y: 150, label: '1' },
        { id: 'a2', type: 'away', x: 400, y: 100, label: '2' },
        { id: 'a3', type: 'away', x: 400, y: 200, label: '3' },
        { id: 'a4', type: 'away', x: 450, y: 50, label: '4' },
        { id: 'a5', type: 'away', x: 500, y: 150, label: 'GK' },
    ]);

    // Simulation State
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [frames, setFrames] = useState<Frame[]>([]);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const recordingInterval = useRef<NodeJS.Timeout | null>(null);
    const playbackInterval = useRef<NodeJS.Timeout | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [draggedToken, setDraggedToken] = useState<string | null>(null);

    // Save/Load State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [tacticName, setTacticName] = useState("");
    const [tacticsList, setTacticsList] = useState<any[]>([]);
    const [isLoadingTactics, setIsLoadingTactics] = useState(false);
    const [activeListTab, setActiveListTab] = useState<'my' | 'presets'>('my');

    // AI State
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const response = await api.post('/tactics/ai-generate', { prompt: aiPrompt });
            if (response.data.error) {
                alert(`AI Hatası: ${response.data.message}\n\nDetay: ${JSON.stringify(response.data.details)}`);
                return;
            }
            if (response.data.frames) {
                setFrames(response.data.frames);
                setTokens(response.data.frames[0].tokens);
                alert("AI Taktiği başarıyla oluşturuldu! Oynat butonuna basarak izleyebilirsiniz.");
            }
        } catch (error: any) {
            console.error("AI Hatası:", error);
            const msg = error.response?.data?.message || error.message;
            alert("AI ile bağlantı kurulamadı: " + msg);
        } finally {
            setIsGenerating(false);
        }
    };

    // Initial orientation: Horizontal is better for desktop
    const BOARD_WIDTH = 600;
    const BOARD_HEIGHT = 400;

    const fetchTactics = async () => {
        setIsLoadingTactics(true);
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const academyId = user.academy._id || user.academy;

            const response = await api.get(`/tactics?academy=${academyId}`);
            setTacticsList(response.data);
        } catch (error) {
            console.error("Taktikler yüklenemedi:", error);
        } finally {
            setIsLoadingTactics(false);
        }
    };

    const saveTactic = async () => {
        if (!tacticName.trim()) {
            alert("Lütfen taktik adı giriniz.");
            return;
        }

        if (frames.length === 0) {
            alert("Kaydedilecek bir hareket yok. Lütfen önce bir kayıt oluşturun.");
            return;
        }

        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const academyId = user.academy._id || user.academy;

            await api.post('/tactics', {
                name: tacticName,
                frames: frames,
                type: 'formation', // Default
                academy: academyId,
                isPreset: false
            });

            alert("Taktik başarıyla kaydedildi!");
            setShowSaveModal(false);
            setTacticName("");
        } catch (error) {
            console.error("Kaydetme hatası:", error);
            alert("Kaydedilirken bir sorun oluştu.");
        }
    };

    const deleteTactic = async (id: string) => {
        if (!confirm("Bu taktiği silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/tactics/${id}`);
            setTacticsList(prev => prev.filter(t => t._id !== id));
        } catch (error) {
            console.error("Silme hatası:", error);
            alert("Silinirken hata oluştu.");
        }
    };

    const loadTactic = (tactic: any) => {
        if (tactic.frames && tactic.frames.length > 0) {
            setFrames(tactic.frames);
            setTokens(tactic.frames[0].tokens);
            // Optionally auto-play
            // alert(`${tactic.name} yüklendi. Oynat butonuna basarak izleyebilirsiniz.`);
            setShowLoadModal(false);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set static size
        canvas.width = BOARD_WIDTH;
        canvas.height = BOARD_HEIGHT;

        drawPitch(ctx, BOARD_WIDTH, BOARD_HEIGHT);
        fetchTactics();
    }, []);

    const drawPitch = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // Grass
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(0, 0, width, height);

        // Stripes (Checkerboard or vertical stripes)
        ctx.fillStyle = '#40916c';
        const stripeWidth = width / 12;
        for (let i = 0; i < 12; i++) {
            if (i % 2 === 0) ctx.fillRect(i * stripeWidth, 0, stripeWidth, height);
        }

        // Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;

        const margin = 20;
        const w = width - margin * 2;
        const h = height - margin * 2;
        const x = margin;
        const y = margin;

        // Outer Boundary
        ctx.strokeRect(x, y, w, h);

        // Center Circle
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
        ctx.stroke();

        // Center Spot
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Center Line
        ctx.beginPath();
        ctx.moveTo(width / 2, y);
        ctx.lineTo(width / 2, y + h);
        ctx.stroke();

        // Penalty Areas
        // Left
        ctx.strokeRect(x, height / 2 - 80, 100, 160);
        ctx.strokeRect(x, height / 2 - 40, 40, 80); // 6 yard
        // Right
        ctx.strokeRect(x + w - 100, height / 2 - 80, 100, 160);
        ctx.strokeRect(x + w - 40, height / 2 - 40, 40, 80); // 6 yard

        // Penalty Spots
        ctx.beginPath();
        ctx.arc(x + 70, height / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + w - 70, height / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Corners
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI / 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + w, y, 10, Math.PI / 2, Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y + h, 10, -Math.PI / 2, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + w, y + h, 10, Math.PI, -Math.PI / 2); ctx.stroke();
    };

    // --- Simulation Logic ---

    const startRecording = () => {
        if (isPlaying) return;
        setIsRecording(true);
        setFrames([]); // Clear previous
        // Capture first frame
        setFrames([{ tokens: JSON.parse(JSON.stringify(tokens)), timestamp: Date.now() }]);

        recordingInterval.current = setInterval(() => {
            setFrames(prev => {
                // Only add frame if something changed? For smoothness, let's just add.
                // Optimize: check diff. For now, simple push.
                const lastFrame = prev[prev.length - 1];
                const currentTokens = tokens; // tokens state is enclosed, need ref or functional update workaround
                // Actually, due to closure stale state, we need to pass tokens via ref or functional updates.
                // React state in setInterval is tricky.
                return prev;
            });
        }, 50);
    };

    // To fix the closure issue with setInterval, let's use a useEffect that deps on [isRecording, tokens]
    // or simply use a ref to track current tokens
    const tokensRef = useRef(tokens);
    useEffect(() => { tokensRef.current = tokens; }, [tokens]);

    useEffect(() => {
        if (isRecording) {
            const startTime = Date.now();
            recordingInterval.current = setInterval(() => {
                setFrames(prev => [
                    ...prev,
                    {
                        tokens: JSON.parse(JSON.stringify(tokensRef.current)),
                        timestamp: Date.now() - startTime
                    }
                ]);
            }, 50); // 20 FPS
        } else {
            if (recordingInterval.current) clearInterval(recordingInterval.current);
        }
        return () => { if (recordingInterval.current) clearInterval(recordingInterval.current); };
    }, [isRecording]);

    const stopRecording = () => {
        setIsRecording(false);
    };

    const playSimulation = () => {
        if (isRecording || frames.length === 0) return;
        setIsPlaying(true);
        setPlaybackIndex(0);

        let index = 0;
        playbackInterval.current = setInterval(() => {
            if (index >= frames.length) {
                stopPlayback();
                return;
            }
            setTokens(frames[index].tokens);
            setPlaybackIndex(index);
            index++;
        }, 50);
    };

    const stopPlayback = () => {
        setIsPlaying(false);
        if (playbackInterval.current) clearInterval(playbackInterval.current);
    };

    const resetSimulation = () => {
        stopPlayback();
        stopRecording();
        setFrames([]);
        setPlaybackIndex(0);
        // Reset tokens to initial positions if needed? Or just leave them.
    };


    // --- Interaction Logic ---

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isPlaying) return;
        if (mode === 'draw' || mode === 'erase') {
            setIsDrawing(true);
            draw(e);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPlaying) return;

        if (isDrawing && (mode === 'draw' || mode === 'erase')) {
            draw(e);
        } else if (draggedToken && mode === 'move') {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            // Scale coords if canvas is scaled visually
            const scaleX = BOARD_WIDTH / rect.width;
            const scaleY = BOARD_HEIGHT / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            // Boundary checks
            const clampedX = Math.max(10, Math.min(BOARD_WIDTH - 10, x));
            const clampedY = Math.max(10, Math.min(BOARD_HEIGHT - 10, y));

            setTokens(prev => prev.map(t =>
                t.id === draggedToken ? { ...t, x: clampedX, y: clampedY } : t
            ));
        }
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        setDraggedToken(null);
    };

    const draw = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || !containerRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = containerRef.current.getBoundingClientRect();
        const scaleX = BOARD_WIDTH / rect.width;
        const scaleY = BOARD_HEIGHT / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (mode === 'erase') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const clearDrawings = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPitch(ctx, canvas.width, canvas.height);
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
            {/* Toolbar Area */}
            <div className="flex flex-wrap items-center justify-between w-full gap-4 bg-[#121212] p-4 rounded-2xl border border-white/10 shadow-xl">
                {/* Tools */}
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
                    <ToolButton
                        active={mode === 'move'}
                        onClick={() => setMode('move')}
                        icon={<MousePointer2 className="w-5 h-5" />}
                        label="Seç"
                    />
                    <ToolButton
                        active={mode === 'draw'}
                        onClick={() => setMode('draw')}
                        icon={<Pen className="w-5 h-5" />}
                        label="Çiz"
                    />
                    <ToolButton
                        active={mode === 'erase'}
                        onClick={() => setMode('erase')}
                        icon={<Eraser className="w-5 h-5" />}
                        label="Sil"
                    />
                    <button
                        onClick={clearDrawings}
                        className="p-2 rounded-lg text-gray-400 hover:bg-white/10 transition-colors"
                        title="Çizimi Temizle"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* Simulation Controls */}
                <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl px-3">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            disabled={isPlaying}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                        >
                            <Circle className="w-3 h-3 fill-current" />
                            Kayıt
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xs text-red-500 font-mono">{(frames.length * 0.05).toFixed(1)}s</span>
                            <button
                                onClick={stopRecording}
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors"
                            >
                                <Square className="w-3 h-3 fill-current" />
                            </button>
                        </div>
                    )}

                    <div className="content-[''] h-6 w-px bg-white/10 mx-1"></div>

                    {!isPlaying ? (
                        <button
                            onClick={playSimulation}
                            disabled={isRecording || frames.length === 0}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${isRecording || frames.length === 0 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                        >
                            <Play className="w-3 h-3 fill-current" />
                            Oynat
                        </button>
                    ) : (
                        <button
                            onClick={stopPlayback}
                            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-all"
                        >
                            <Square className="w-3 h-3 fill-current" />
                            Durdur
                        </button>
                    )}

                    {frames.length > 0 && !isRecording && !isPlaying && (
                        <button
                            onClick={resetSimulation}
                            className="text-xs text-gray-500 hover:text-white underline ml-2"
                        >
                            Sıfırla
                        </button>
                    )}
                </div>

                {/* Color Picker */}
                <div className="flex gap-1.5 bg-white/5 p-2 rounded-xl">
                    {['#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'].map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

            {/* AI Prompt Bar */}
            <div className="w-full max-w-[800px] flex items-center gap-3 bg-indigo-600/10 p-2 rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="AI'ya taktik anlatın (Örn: 'Sağ kanattan hızlı hücum ve orta kafa golü')"
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder:text-gray-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                />
                <button
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isGenerating ? 'bg-gray-700 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}
                >
                    {isGenerating ? 'Üretiliyor...' : 'Simüle Et'}
                </button>
            </div>

            {/* Board Container */}
            <div className="relative w-full max-w-[800px] aspect-[3/2] bg-[#1a1a1a] rounded-xl shadow-2xl border-4 border-[#252525] overflow-hidden select-none">
                <div
                    ref={containerRef}
                    className="absolute inset-0 w-full h-full"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ pointerEvents: mode === 'draw' || mode === 'erase' ? 'auto' : 'none' }}
                    />

                    {/* Tokens */}
                    {tokens.map(token => (
                        <div
                            key={token.id}
                            onMouseDown={(e) => {
                                if (mode === 'move' && !isPlaying) {
                                    e.stopPropagation();
                                    setDraggedToken(token.id);
                                }
                            }}
                            className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform 
                                ${mode === 'move' && !isPlaying ? 'cursor-grab active:cursor-grabbing hover:scale-110' : ''}
                                ${token.type === 'home' ? 'bg-red-600 text-white ring-2 ring-white/50' :
                                    token.type === 'away' ? 'bg-blue-600 text-white ring-2 ring-white/50' :
                                        'bg-white text-gray-900 ring-2 ring-gray-300'}`}
                            style={{
                                left: `${(token.x / BOARD_WIDTH) * 100}%`,
                                top: `${(token.y / BOARD_HEIGHT) * 100}%`,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.4)'
                            }}
                        >
                            {token.type !== 'ball' ? token.label : ''}
                            {token.type === 'ball' && <div className="w-3 h-3 rounded-full bg-black/80 pattern-dots"></div>}
                        </div>
                    ))}
                </div>

                {/* Status Overlay */}
                {(isRecording || isPlaying) && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {isRecording ? 'KAYDEDİLİYOR' : 'OYNATILIYOR'}
                        </span>
                    </div>
                )}
            </div>



            <div className="w-full max-w-[800px] mt-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-400">Hızlı Hazır Taktikler</h4>
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-500 rounded-lg text-xs font-bold transition-all"
                    >
                        <Save className="w-3 h-3" />
                        Mevcut Durumu Kaydet
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {tacticsList.filter(t => t.isPreset).slice(0, 4).map((tactic) => (
                        <button
                            key={tactic._id}
                            onClick={() => loadTactic(tactic)}
                            className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-all text-left group"
                        >
                            <div className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors truncate">{tactic.name}</div>
                            <div className="text-[10px] text-gray-500 truncate">{tactic.description || 'Açıklama yok'}</div>
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            fetchTactics();
                            setShowLoadModal(true);
                        }}
                        className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white"
                    >
                        <FolderOpen className="w-4 h-4" />
                        <span className="text-xs font-medium">Tümünü Gör</span>
                    </button>
                </div>
            </div>

            {/* Save Modal */}
            {
                showSaveModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSaveModal(false)}>
                        <div className="bg-[#121212] rounded-2xl p-6 max-w-sm w-full border border-white/10" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-bold mb-4 text-white">Taktiği Kaydet</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-400">Taktik Adı</label>
                                    <input
                                        type="text"
                                        value={tacticName}
                                        onChange={(e) => setTacticName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="Örn: Korner Organizasyonu"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowSaveModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-white transition-all">İptal</button>
                                    <button onClick={saveTactic} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-white transition-all">Kaydet</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Load Modal */}
            {
                showLoadModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLoadModal(false)}>
                        <div className="bg-[#121212] rounded-2xl p-6 max-w-2xl w-full border border-white/10 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Taktik Yükle</h3>
                                <button onClick={() => setShowLoadModal(false)}><X className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                            </div>

                            <div className="flex gap-4 mb-4 border-b border-white/10 pb-4">
                                <button
                                    onClick={() => setActiveListTab('my')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeListTab === 'my' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Kayıtlı Taktiklerim
                                </button>
                                <button
                                    onClick={() => setActiveListTab('presets')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeListTab === 'presets' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Hazır Taktikler
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {isLoadingTactics ? (
                                    <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
                                ) : tacticsList.filter(t => activeListTab === 'presets' ? t.isPreset : !t.isPreset).length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        {activeListTab === 'my' ? "Henüz kaydedilmiş taktik yok." : "Hazır taktik bulunamadı."}
                                    </div>
                                ) : (
                                    tacticsList.filter(t => activeListTab === 'presets' ? t.isPreset : !t.isPreset).map((tactic: any) => (
                                        <div key={tactic._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                                            <div>
                                                <div className="font-bold text-white mb-1">{tactic.name}</div>
                                                <div className="text-xs text-gray-500">{new Date(tactic.createdAt).toLocaleDateString("tr-TR")} • {tactic.frames?.length || 0} kare</div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => loadTactic(tactic)}
                                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg"
                                                    title="Yükle"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                                {!tactic.isPreset && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteTactic(tactic._id); }}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg"
                                                        title="Sil"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

function ToolButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
            title={label}
        >
            {icon}
        </button>
    );
}
