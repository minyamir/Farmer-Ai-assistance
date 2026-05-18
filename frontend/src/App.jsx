import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, Send, Loader2, Sprout, Volume2, X, Image as ImageIcon, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  // --- State Management ---
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('am');
  const [playingId, setPlayingId] = useState(null);

  // --- Refs ---
  const scrollRef = useRef();
  const fileInputRef = useRef();
  const audioRef = useRef(null);

  // --- Auto-Scroll Logic ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- Audio Control Logic ---
  const handleAudio = (msgId, audioUrl) => {
    // If clicking the same button that is currently playing: Stop it.
    if (playingId === msgId) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingId(null);
      return;
    }

    // If another audio is playing: Stop it before starting new one.
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(`http://localhost:5000${audioUrl}`);
    audioRef.current = audio;
    setPlayingId(msgId);
    
    audio.play().catch(err => console.error("Audio Playback Error:", err));

    audio.onended = () => {
      setPlayingId(null);
      audioRef.current = null;
    };
  };

  // --- API Interaction ---
  const handleSend = async () => {
    if (!inputText && !image) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: inputText,
      image: preview,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setPreview(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('text', inputText);
    formData.append('language', language);
    if (image) formData.append('image', image);
    setImage(null);

    try {
      const res = await axios.post('http://localhost:5000/api/ai', formData);
      
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        text: res.data.text,
        audio: res.data.audio,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Connection Error:", err);
      // Optional: Add an error message bubble here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F4F1EA] text-stone-900 font-sans overflow-hidden">
      
      {/* 1. Sticky Navigation */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-100">
            <Sprout size={20} />
          </div>
          <div>
            <h1 className="font-black text-emerald-900 text-xs tracking-widest uppercase">Agri-Pro AI</h1>
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">Digital Extension Officer</p>
          </div>
        </div>
        
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
          {[
            { code: 'am', label: 'አማ' },
            { code: 'om', label: 'ORM' },
            { code: 'en', label: 'EN' }
          ].map(l => (
            <button 
              key={l.code} 
              onClick={() => setLanguage(l.code)} 
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                language === l.code ? 'bg-white shadow-sm text-emerald-700' : 'text-stone-400'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 2. Chat History Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center opacity-40">
            <Sprout size={64} strokeWidth={1} className="mb-4" />
            <p className="text-sm font-bold max-w-[200px]">ጤና ይስጥልኝ! ጥያቄዎን እዚህ ይጀምሩ። (Hello! Start your question here.)</p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div 
            key={msg.id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-[1.5rem] p-4 shadow-sm relative ${
              msg.role === 'user' 
                ? 'bg-emerald-700 text-white rounded-tr-none' 
                : 'bg-white text-stone-800 rounded-tl-none border border-stone-200'
            }`}>
              {msg.image && (
                <img src={msg.image} className="rounded-xl mb-3 w-full max-h-60 object-cover border border-black/5" alt="Crop" />
              )}
              
              <p className="text-[15px] leading-relaxed font-medium">
                {msg.text}
              </p>
              
              {msg.audio && (
                <button 
                  onClick={() => handleAudio(msg.id, msg.audio)}
                  className={`mt-4 flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-black transition-all w-full justify-center border shadow-sm ${
                    playingId === msg.id 
                      ? 'bg-orange-50 text-orange-700 border-orange-100 ring-2 ring-orange-200' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100'
                  }`}
                >
                  {playingId === msg.id ? (
                    <><Square size={16} fill="currentColor" /> አቁም (Stop)</>
                  ) : (
                    <><Volume2 size={18} /> አዳምጥ (Listen)</>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-none shadow-sm animate-pulse">
              <Loader2 size={20} className="animate-spin text-emerald-600" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

      {/* 3. Input Dock */}
      <footer className="bg-white border-t border-stone-200 p-4 pb-10 shadow-2xl">
        <AnimatePresence>
          {preview && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 90, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="relative mb-3 flex items-center">
              <img src={preview} className="h-20 w-20 object-cover rounded-2xl border-2 border-emerald-500 shadow-lg" />
              <button 
                onClick={() => {setPreview(null); setImage(null)}} 
                className="absolute -top-2 left-16 bg-red-500 text-white rounded-full p-1 border-2 border-white shadow-md"
              >
                <X size={12}/>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <button 
            onClick={() => fileInputRef.current.click()}
            className="p-4 bg-stone-100 text-stone-500 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-all"
          >
            <Camera size={24} />
          </button>
          
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
            const file = e.target.files[0];
            if(file) {
              setImage(file);
              setPreview(URL.createObjectURL(file));
            }
          }} />

          <div className="flex-1">
            <input 
              className="w-full bg-stone-100 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 text-stone-800 placeholder:text-stone-400 outline-none transition-all"
              placeholder={language === 'am' ? "መልእክት ይጻፉ..." : "Ask Agri-Pro..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={loading || (!inputText && !image)}
            className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 disabled:bg-stone-300 disabled:shadow-none transition-all active:scale-95"
          >
            <Send size={24} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;