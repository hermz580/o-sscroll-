import React, { useState } from 'react';
import { Upload, Star, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ name: '', origin: '', date: '', time: '' });
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReading, setShowReading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    let extractedText = "";

    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          extractedText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
      } catch (err) {
        console.error("PDF Parsing error:", err);
        setReading("Error extracting text from PDF.");
        setLoading(false);
        setShowReading(true);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        pdfText: extractedText
      };

      const response = await fetch('/api/reading', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      setReading(result.reading);
      setShowReading(true);
    } catch (error) {
      console.error(error);
      setReading('An error occurred. Please try again.');
      setShowReading(true);
    } finally {
      setLoading(false);
    }
  };

  if (showReading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
        <header className="flex items-center justify-center gap-2 mb-8">
          <Star className="text-yellow-400 w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-serif text-yellow-100">Astro Essence Portal</h1>
        </header>
        <main className="max-w-2xl mx-auto bg-gray-900 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-serif text-yellow-200 mb-6">Your Reading</h2>
          <div className="whitespace-pre-wrap leading-relaxed text-gray-200 text-lg">
            {reading}
          </div>
          <button 
            onClick={() => { setShowReading(false); setReading(''); }} 
            className="mt-8 p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center w-full transition-colors"
          >
            Start New Reading
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <header className="flex items-center justify-center gap-2 mb-8">
        <Star className="text-yellow-400 w-8 h-8" />
        <h1 className="text-3xl md:text-4xl font-serif text-yellow-100">Astro Essence Portal</h1>
      </header>

      <main className="max-w-xl mx-auto bg-gray-900 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-yellow-200">Who are you?</h2>
          <div className="flex flex-col gap-4">
            <input type="text" placeholder="Your True Name" value={formData.name} className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 text-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="text" placeholder="Birthplace (Town/City)" value={formData.origin} className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 text-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all" onChange={e => setFormData({...formData, origin: e.target.value})} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-yellow-200">When did you arrive?</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 mb-2 text-sm">Date of Birth</label>
              <input type="date" value={formData.date} className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 text-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all" onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="block text-gray-400 mb-2 text-sm">Time of Birth</label>
              <input type="time" value={formData.time} className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 text-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all" onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-yellow-200">Upload your Chart (PDF)</h2>
          <div 
            className="border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center bg-gray-800 hover:border-yellow-500 transition-colors cursor-pointer relative" 
            onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }} 
            onDragOver={e => e.preventDefault()}
          >
            <input 
              type="file" 
              accept=".pdf" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={e => setFile(e.target.files?.[0] || null)} 
            />
            <Upload className="mx-auto mb-4 text-gray-400 w-12 h-12" />
            <p className="mb-2 text-lg text-gray-300">Drag & drop your PDF here</p>
            <p className="text-sm text-gray-500">or click to browse</p>
            {file && <p className="mt-4 text-yellow-400 font-medium bg-yellow-950/30 p-2 rounded-lg inline-block">{file.name}</p>}
          </div>
        </section>

        <button 
          onClick={handleAnalyze} 
          className="mt-4 p-4 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-lg shadow-lg shadow-yellow-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><Sparkles className="w-6 h-6" /> Generate Reading</>}
        </button>
      </main>
    </div>
  );
}
