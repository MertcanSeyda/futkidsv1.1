"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Edit2, Check, X, Trash2, Shield, Swords, Zap, Plus, FileText, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "@/lib/api";

// --- Types ---
export interface DetailedStat {
    name: string;
    value: number;
}

export interface StatCategory {
    label: string;
    baseValue: number;
    subStats: DetailedStat[];
}

export interface PlayerTrait {
    id: string;
    name: string;
    description: string;
}

export interface Playstyle {
    _id: string;
    title: string;
    description: string;
    active: boolean;
}

export interface CoachNote {
    id: string;
    text: string;
    date: Date;
    author: string;
}

export interface PlayerDetailedStatsProps {
    stats: StatCategory[];
    traits: PlayerTrait[];
    initialNotes?: CoachNote[];
    playstyles?: Playstyle[];
    playerInfo?: any;
    onSaveNote?: (noteText: string) => void;
    onUpdateNote?: (noteId: string, newText: string) => void;
    onDeleteNote?: (noteId: string) => void;
    onAddPlaystyle?: (title: string, description: string) => void;
    onDeletePlaystyle?: (playstyleId: string) => void;
    onTogglePlaystyle?: (playstyleId: string, active: boolean) => void;
    className?: string;
}

// --- Helper for Colors ---
const getStatColor = (val: number) => {
    if (val >= 70) return "text-[#00e600]";     // Bright Green
    if (val >= 50) return "text-[#e6b800]";     // Orange-Yellow
    return "text-[#e60000]";                    // Red
};

const getProgressBarColor = (val: number) => {
    if (val >= 70) return "bg-[#00e600]";
    if (val >= 50) return "bg-[#e6b800]";
    return "bg-[#e60000]";
};

// --- Subcomponents ---

const StatBlock = ({ category }: { category: StatCategory }) => {
    return (
        <div className="flex flex-col mb-7">
            {/* Header: Title and Value */}
            <div className="flex justify-between items-baseline mb-1 px-1">
                <h4 className="text-white font-bold text-[15px] xl:text-[16px] capitalize">{category.label}</h4>
                <span className={cn("font-bold text-[15px] xl:text-[16px]", getStatColor(category.baseValue))}>
                    {category.baseValue}
                </span>
            </div>
            
            {/* The Solid Line / Progress Bar */}
            <div className="h-[3px] w-full bg-[#333] mb-3 relative overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.baseValue}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={cn("absolute top-0 left-0 h-full", getProgressBarColor(category.baseValue))}
                />
            </div>
            
            {/* Substats */}
            <div className="flex flex-col space-y-[4px] px-1">
                {category.subStats.map((sub, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[13px]">
                        <span className="text-[#888] capitalize">{sub.name}</span>
                        <span className={cn("font-bold", getStatColor(sub.value))}>{sub.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Player Info Section (Matches FUTBIN Player Profile) ---
const PlayerInfoSection = ({ playerInfo }: { playerInfo?: any }) => {
    const info = playerInfo || {
        fullName: "Sporcu Adı",
        position: "MEVKİ",
        teamCategory: "U15",
        birthDate: "2010-01-01",
        height: "175",
        weight: "65",
    };

    const calculateAge = (dob: string) => {
        if (!dob) return "--";
        const diffMs = Date.now() - new Date(dob).getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    const age = calculateAge(info.birthDate);
    
    // AI Report State
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState("");
    
    const reportRef = useRef<HTMLDivElement>(null);
    const [generatedReport, setGeneratedReport] = useState<string | null>(null);

    const handleGenerateAIReport = async () => {
        setIsGenerating(true);
        setAiError("");
        setGeneratedReport(null);

        try {
            // First, call backend API which handles Gemini API
            const response = await api.post(`/students/${info._id}/ai-report`);
            const reportText = response.data?.report;

            if (!reportText) {
                throw new Error("Rapor alınamadı.");
            }
            
            setGeneratedReport(reportText);

            // Immediately let React render the hidden report div, then wait a tick
            setTimeout(async () => {
                if (!reportRef.current) return;
                
                try {
                    const canvas = await html2canvas(reportRef.current, {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: '#111111'
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, pdf.internal.pageSize.getHeight()));
                    
                    // Add new pages if height exceeds A4
                    let leftHeight = pdfHeight - pdf.internal.pageSize.getHeight();
                    let position = -pdf.internal.pageSize.getHeight();
                    
                    while (leftHeight > 0) {
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                        leftHeight -= pdf.internal.pageSize.getHeight();
                        position -= pdf.internal.pageSize.getHeight();
                    }
                    
                    pdf.save(`${info.fullName.replace(/\s+/g, '_')}_A Scout_Raporu.pdf`);
                } catch (pdfErr) {
                    console.error("PDF Generation Error:", pdfErr);
                    setAiError("PDF oluşturulurken hata oluştu.");
                } finally {
                    setIsGenerating(false);
                }
            }, 500);

        } catch (error: any) {
            console.error(error);
            setAiError(error.message || "Bir hata oluştu.");
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col mt-4 relative">
            {/* Upper tags (Nation, League, Club, Card Type) */}
            <div className="flex justify-between items-center mb-5 text-[#aaa] text-[11px] font-bold">
                <div className="flex items-center gap-1.5"><span className="text-lg">🇹🇷</span> Türkiye</div>
                <div className="flex items-center gap-1.5"><span className="text-lg">🏆</span> FUTKIDS Lig</div>
                <div className="flex items-center gap-1.5">FUTKIDS</div>
                <div className="text-[#e6b800] bg-[#e6b800]/10 px-2 py-0.5 rounded">Gold Rare</div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-4 gap-y-4 gap-x-2 border-t border-b border-[#333] py-4 mb-5">
                <div className="flex flex-col">
                    <span className="text-[#888] text-[9px] uppercase tracking-wider mb-0.5">Beceriler</span>
                    <span className="text-white text-[12px] font-bold flex items-center gap-1">4 <span className="text-[#e6b800] text-[10px]">★</span></span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[#888] text-[9px] uppercase tracking-wider mb-0.5">Z. Ayak</span>
                    <span className="text-white text-[12px] font-bold flex items-center gap-1">3 <span className="text-[#e6b800] text-[10px]">★</span></span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[#888] text-[9px] uppercase tracking-wider mb-0.5">Boy</span>
                    <span className="text-white text-[12px] font-bold">{info.height || '--'}cm</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[#888] text-[9px] uppercase tracking-wider mb-0.5">Ayak</span>
                    <span className="text-white text-[12px] font-bold">Sağ</span>
                </div>
                
                <div className="flex flex-col col-span-2">
                    <span className="text-[#888] text-[9px] uppercase tracking-wider mb-0.5">Vücut Tipi</span>
                    <span className="text-white text-[11px] font-bold">Kondisyonlu & Normal</span>
                </div>
                <div className="flex flex-col col-span-2">
                    <span className="text-[#888] text-[9px] uppercase tracking-wider mb-0.5">Yaş</span>
                    <span className="text-white text-[11px] font-bold">{age} Yaşında</span>
                </div>
            </div>

            {/* Badges / Traits with Lucide Icons */}
            <div className="flex gap-6 border-b border-[#333] pb-5 mb-5">
                <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#222] border border-[#444] rounded rotate-45 mb-2 hover:border-[#00e600]/50 transition-colors">
                        <Shield className="w-4 h-4 -rotate-45 text-[#e6b800]" strokeWidth={2} />
                    </div>
                    <span className="text-[#e6b800] text-[9px] font-bold mt-1">Blok</span>
                </div>
                <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#222] border border-[#444] rounded rotate-45 mb-2 hover:border-[#00e600]/50 transition-colors">
                        <Swords className="w-4 h-4 -rotate-45 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-white text-[9px] font-bold mt-1">Kayarak<br/>Müdahale</span>
                </div>
                <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-[#222] border border-[#444] rounded rotate-45 mb-2 hover:border-[#00e600]/50 transition-colors">
                        <Zap className="w-4 h-4 -rotate-45 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-white text-[9px] font-bold mt-1">Hızlı<br/>Adımlar</span>
                </div>
            </div>

            {/* AI Report Generation Section */}
            <div className="flex flex-col mt-auto bg-[#1a1a1a] border border-[#333]/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider">AI Performans Raporu</h4>
                </div>
                
                <div className="space-y-3">
                    {aiError && (
                        <p className="text-[10px] text-red-400 font-bold">{aiError}</p>
                    )}

                    <button 
                        onClick={handleGenerateAIReport}
                        disabled={isGenerating}
                        className={cn(
                            "w-full mt-2 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                            isGenerating
                                ? "bg-[#333] text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                        )}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Rapor Hazırlanıyor...
                            </>
                        ) : (
                            <>
                                <FileText className="w-3.5 h-3.5" />
                                PDF Raporu Oluştur
                            </>
                        )}
                    </button>
                    <p className="text-[#666] text-[9px] text-center mt-2 px-2 leading-relaxed">
                        Tüm oyuncu özellikleri Gemini AI tarafından analiz edilip profesyonel PDF raporuna dönüştürülür.
                    </p>
                </div>
            </div>

            {/* Hidden Div for PDF Generation */}
            {generatedReport && (
                <div className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0">
                    <div ref={reportRef} className="w-[800px] p-12 font-sans border-4" style={{ backgroundColor: '#111111', borderColor: '#222222', color: '#ffffff' }}>
                        
                        {/* Header */}
                        <div className="flex items-center justify-between border-b-2 pb-8 mb-8" style={{ borderColor: '#9333ea' }}>
                            <div>
                                <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2" style={{ color: '#ffffff' }}>{info.fullName}</h1>
                                <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
                                    <span>MEVKİ: {info.position}</span>
                                    <span>•</span>
                                    <span>YAŞ: {age}</span>
                                    <span>•</span>
                                    <span>BOY: {info.height || '--'} cm</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-black" style={{ color: '#c084fc' }}>AI SCOUT RAPORU</h2>
                                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>{new Date().toLocaleDateString('tr-TR')}</p>
                            </div>
                        </div>

                        {/* Summary / Report Content */}
                        <div className="mb-10 text-[15px] leading-relaxed" style={{ color: '#d1d5db' }}>
                            {generatedReport.split('\n').map((line, idx) => {
                                if (line.startsWith('## ') || line.startsWith('# ')) {
                                    return <h3 key={idx} className="font-black text-xl mb-3 mt-6 uppercase border-l-4 pl-3" style={{ color: '#ffffff', borderColor: '#a855f7' }}>{line.replace(/#/g, '').trim()}</h3>;
                                }
                                if (line.startsWith('**') || line.includes('**')) {
                                   const parts = line.split('**');
                                   return (
                                       <p key={idx} className="mb-3">
                                           {parts.map((p, i) => i % 2 === 1 ? <strong key={i} style={{ color: '#ffffff' }}>{p}</strong> : p)}
                                       </p>
                                   );
                                }
                                return <p key={idx} className="mb-2">{line}</p>;
                            })}
                        </div>
                        
                        {/* Footer Disclaimer */}
                        <div className="mt-12 pt-6 border-t text-center text-xs flex items-center justify-center gap-2" style={{ borderColor: '#333333', color: '#4b5563' }}>
                            <Sparkles className="w-3 h-3" style={{ color: '#a855f7' }} />
                            Bu rapor Gemini AI altyapısı kullanılarak FUTKIDS sistemi tarafından otomatik üretilmiştir.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CoachNotesSection = ({ 
    initialNotes = [], 
    onSave, 
    onUpdate, 
    onDelete 
}: { 
    initialNotes?: CoachNote[], 
    onSave?: (t: string) => void,
    onUpdate?: (id: string, t: string) => void,
    onDelete?: (id: string) => void
}) => {
    const [notes, setNotes] = useState<CoachNote[]>(initialNotes);
    const [newNoteText, setNewNoteText] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    const handleAdd = () => {
        if (!newNoteText.trim()) return;
        const newNote: CoachNote = {
            id: Date.now().toString(),
            text: newNoteText,
            date: new Date(),
            author: "Coach", // Placeholder
        };
        setNotes([newNote, ...notes]);
        setNewNoteText("");
        if (onSave) onSave(newNoteText);
    };

    const startEditing = (note: CoachNote) => {
        setEditingId(note.id);
        setEditText(note.text);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditText("");
    };

    const saveEdit = (id: string) => {
        setNotes(notes.map(n => n.id === id ? { ...n, text: editText } : n));
        setEditingId(null);
        if (onUpdate) onUpdate(id, editText);
    };

    const handleDelete = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
        if (onDelete) onDelete(id);
    };

    return (
        <div className="flex flex-col h-full rounded mt-6 lg:mt-0 pt-6 lg:pt-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-[#333]">
            <h4 className="flex items-center justify-between mb-4">
                <span className="text-white font-bold text-[15px]">ANTRENÖR NOTLARI</span>
                <span className="bg-[#00e600] text-black text-[10px] font-black px-1.5 py-0.5 rounded">BETA</span>
            </h4>
            
            {/* Add Note Input */}
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Taktiksel bir not ekle..."
                    className="flex-1 bg-[#222] border border-[#333] rounded px-3 py-2 text-[13px] text-white focus:outline-none focus:border-neutral-500 transition-colors"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button 
                    onClick={handleAdd}
                    className="bg-[#333] hover:bg-[#444] text-white font-bold px-3 py-2 rounded text-[12px] transition-colors"
                >
                    EKLE
                </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                <AnimatePresence>
                    {notes.length === 0 ? (
                        <p className="text-[#888] text-[13px] italic mt-2">Daha fazla not bulunmamakta.</p>
                    ) : (
                        notes.map(note => (
                            <motion.div 
                                key={note.id}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#222] rounded p-4 group flex flex-col items-start w-full relative border border-[#333]"
                            >
                                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                     <button onClick={() => startEditing(note)} className="hover:text-white transition-colors text-neutral-400"><Edit2 className="w-3.5 h-3.5" /></button>
                                     <button onClick={() => handleDelete(note.id)} className="hover:text-[#ff3333] transition-colors text-neutral-400">
                                         <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                </div>
                                
                                {editingId === note.id ? (
                                    <div className="flex flex-col gap-2 w-full mt-6">
                                        <textarea 
                                            className="w-full bg-[#1a1a1a] border border-[#444] rounded p-2 text-[13px] text-white focus:outline-none resize-none min-h-[50px]"
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={cancelEditing} className="p-1 text-neutral-400 hover:text-white transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => saveEdit(note.id)} className="p-1 text-[#00E500] transition-colors">
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-[#444] text-white font-bold px-2 py-0.5 rounded text-[10px]">
                                                NOT
                                            </div>
                                            <span className="text-neutral-500 text-[10px]">{note.date.toLocaleDateString('tr-TR')}</span>
                                        </div>
                                        <p className="text-neutral-300 text-[13px] break-words whitespace-pre-wrap leading-relaxed w-11/12">{note.text}</p>
                                    </>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Playstyle Section ---
const PlaystyleSection = ({
    playstyles = [],
    onAdd,
    onDelete,
    onToggle,
}: {
    playstyles?: Playstyle[];
    onAdd?: (title: string, description: string) => void;
    onDelete?: (id: string) => void;
    onToggle?: (id: string, active: boolean) => void;
}) => {
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [showInfo, setShowInfo] = useState(false);

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        if (onAdd) onAdd(newTitle.trim(), newDesc.trim());
        setNewTitle('');
        setNewDesc('');
        setShowAdd(false);
    };

    return (
        <div className="mt-6 lg:mt-0 pt-6 lg:pt-0 border-t lg:border-t-0 border-[#333]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-[15px]">OYUN STİLLERİ</span>
                    <div className="relative">
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className="w-5 h-5 bg-[#333] hover:bg-[#444] rounded-full flex items-center justify-center transition-colors"
                        >
                            <Info className="w-3 h-3 text-[#888]" />
                        </button>
                        {showInfo && (
                            <div className="absolute left-0 top-7 z-50 w-64 bg-[#1a1a1a] border border-[#444] rounded-lg p-3 shadow-xl">
                                <p className="text-[11px] text-gray-300 leading-relaxed">
                                    <strong className="text-white">Oyun Stilleri</strong>, oyuncunun sahada öne çıkan yetenek ve eğilimlerini tanımlar. 
                                    Antrenörler her oyuncuya özel başlık ve açıklama ekleyerek oyuncunun güçlü yönlerini belgeleyebilir.
                                </p>
                                <button onClick={() => setShowInfo(false)} className="mt-2 text-[9px] text-[#888] hover:text-white transition-colors">Kapat</button>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="w-6 h-6 bg-[#333] hover:bg-[#00e600]/20 hover:text-[#00e600] text-[#888] rounded-lg flex items-center justify-center transition-all"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Add Form */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="bg-[#222] border border-[#333] rounded-lg p-3 space-y-2">
                            <input
                                type="text"
                                placeholder="Başlık (ör: Hızlı Kanat)"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#00e600]/50 transition-colors"
                            />
                            <textarea
                                placeholder="Açıklama (isteğe bağlı)"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#00e600]/50 transition-colors resize-none min-h-[40px]"
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-[10px] font-bold text-[#888] hover:text-white transition-colors">İPTAL</button>
                                <button onClick={handleAdd} className="px-3 py-1.5 text-[10px] font-bold bg-[#00e600] text-black rounded transition-all hover:bg-[#00cc00]">EKLE</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Playstyle Cards */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {playstyles.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-[#555] text-[11px] italic">Henüz oyun stili eklenmedi.</p>
                        <p className="text-[#444] text-[10px] mt-1">Yukarıdaki + butonuna tıklayarak ekleyin.</p>
                    </div>
                ) : (
                    playstyles.map((ps) => (
                        <motion.div
                            key={ps._id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "group relative rounded-lg border p-3 transition-all cursor-pointer",
                                ps.active
                                    ? "bg-[#00e600]/5 border-[#00e600]/20 hover:border-[#00e600]/40"
                                    : "bg-[#222] border-[#333] hover:border-[#555] opacity-50"
                            )}
                            onClick={() => onToggle && onToggle(ps._id, !ps.active)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                            ps.active ? "bg-[#00e600]" : "bg-[#555]"
                                        )} />
                                        <span className={cn(
                                            "text-[12px] font-bold truncate",
                                            ps.active ? "text-[#00e600]" : "text-[#888]"
                                        )}>
                                            {ps.title}
                                        </span>
                                    </div>
                                    {ps.description && (
                                        <p className="text-[10px] text-[#777] mt-1 ml-3.5 leading-relaxed line-clamp-2">
                                            {ps.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onDelete) onDelete(ps._id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-[#666] hover:text-[#ff3333] transition-all flex-shrink-0"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- Main Component ---
export const PlayerDetailedStats = ({ stats, traits, initialNotes, playstyles, playerInfo, onSaveNote, onUpdateNote, onDeleteNote, onAddPlaystyle, onDeletePlaystyle, onTogglePlaystyle, className }: PlayerDetailedStatsProps) => {
    // Left side is 3 columns of stats (Pace/Dribbling, Shooting/Defending, Passing/Physical) based on FUTBIN layout
    const col1 = [stats[0], stats[3]]; // PAC, DRI
    const col2 = [stats[1], stats[4]]; // SHO, DEF
    const col3 = [stats[2], stats[5]]; // PAS, PHY

    return (
        <div className={cn("w-full bg-[#1e1e1e] rounded-[10px] shadow-2xl overflow-hidden font-sans border border-[#333] px-6 py-6", className)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
                
                {/* 1. Left Section: 3 columns of stats (Like FUTBIN) */}
                <div className="col-span-1 lg:col-span-6 grid grid-cols-3 gap-x-4 xl:gap-x-8 gap-y-0">
                    <div className="flex flex-col">
                        {col1.map((cat, idx) => (
                            <StatBlock key={idx} category={cat} />
                        ))}
                    </div>
                    <div className="flex flex-col">
                        {col2.map((cat, idx) => (
                            <StatBlock key={idx} category={cat} />
                        ))}
                    </div>
                    <div className="flex flex-col">
                        {col3.map((cat, idx) => (
                            <StatBlock key={idx} category={cat} />
                        ))}
                    </div>
                </div>

                {/* 2. Middle Section: Player Info */}
                <div className="col-span-1 lg:col-span-3 lg:pl-6 border-l-0 lg:border-l border-[#333]">
                   <PlayerInfoSection playerInfo={playerInfo} />
                </div>

                {/* 3. Right Section: Coach Notes */}
                <div className="col-span-1 lg:col-span-3">
                    <CoachNotesSection 
                        initialNotes={initialNotes} 
                        onSave={onSaveNote}
                        onUpdate={onUpdateNote}
                        onDelete={onDeleteNote}
                    />
                </div>

            </div>

            {/* 4. Bottom: Playstyles Section (full width) */}
            <div className="mt-6 pt-6 border-t border-[#333]">
                <PlaystyleSection
                    playstyles={playstyles}
                    onAdd={onAddPlaystyle}
                    onDelete={onDeletePlaystyle}
                    onToggle={onTogglePlaystyle}
                />
            </div>
        </div>
    );
};

