"use client";

import React, { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: '🌐 Welcome to India Trade Overseas. I am your digital logistics assistant. May I please know your Full Name to initiate our trade routing deck?' }
  ]);
  
  const [collectedData, setCollectedData] = useState({
    customer_name: '',
    product_category: '',
    quantity_required: '',
    destination_city: '',
    company_name: '',
    mobile_raw: '',
    email_raw: '',
    payment_terms: '',
    delivery_terms: ''
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { field: 'customer_name', question: '' }, 
    { field: 'product_category', question: 'Excellent. What core commodity sector are you looking to procure? (Options: Stone Aggregates, Coal, Tea, Rice, Agro Products)' },
    { field: 'quantity_required', question: 'Understood. What is your total target Volume Required in Metric Tons (MT)?' },
    { field: 'destination_city', question: 'What is the final Destination Hub / Delivery City for this freight consignment?' },
    { field: 'company_name', question: 'Got it. What is your registered Corporate Entity or Company Name?' },
    { field: 'mobile_raw', question: 'Please share your direct Mobile / WhatsApp Number for compliance screening.' },
    { field: 'email_raw', question: 'What is your official Corporate Email Address?' },
    { field: 'payment_terms', question: 'What are your preferred Payment Terms? (e.g., Letter of Credit, Advance Wire Transfer)' },
    { field: 'delivery_terms', question: 'Finally, what are your target Delivery Terms? (e.g., Ex-Works, FOB, CIF)' }
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue.trim();
    const activeStepObj = steps[currentStep];
    
    const dynamicDataSnapshot = { ...collectedData, [activeStepObj.field]: userMessage };
    setCollectedData(dynamicDataSnapshot);

    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setIsProcessing(true);

    const nextStep = currentStep + 1;

    if (nextStep < steps.length) {
      setTimeout(() => {
        setCurrentStep(nextStep);
        setChatHistory(prev => [...prev, { sender: 'ai', text: steps[nextStep].question }]);
        setIsProcessing(false);
      }, 700);
    } else {
      setTimeout(async () => {
        setChatHistory(prev => [...prev, { sender: 'ai', text: '⚙️ Formatting operational parameters... Compiling pipeline credentials...' }]);
        
        const numericQuantity = parseFloat(dynamicDataSnapshot.quantity_required.replace(/[^0-9.]/g, '')) || 0;
        
        let normalizedCategory = 'stone';
        const rawCat = dynamicDataSnapshot.product_category.toLowerCase();
        if (rawCat.includes('coal')) normalizedCategory = 'coal';
        if (rawCat.includes('tea')) normalizedCategory = 'tea';
        if (rawCat.includes('rice')) normalizedCategory = 'rice';
        if (rawCat.includes('agro')) normalizedCategory = 'agro';

        try {
          const response = await fetch('https://ito-backend-v3di.onrender.com/api/leads/public-ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_name: dynamicDataSnapshot.customer_name,
              company_name: dynamicDataSnapshot.company_name || 'Individual Operator',
              mobile_raw: dynamicDataSnapshot.mobile_raw,
              email_raw: dynamicDataSnapshot.email_raw,
              product_category: normalizedCategory,
              quantity_required: numericQuantity,
              destination_city: dynamicDataSnapshot.destination_city,
              payment_terms: dynamicDataSnapshot.payment_terms,
              delivery_terms: dynamicDataSnapshot.delivery_terms,
              chat_summary: `AI Automated Assistant Stream: Conversational lead requirement captured for ${normalizedCategory} division bulk transport pools.`
            })
          });

          const contentType = response.headers.get("content-type");
          if (!response.ok || (contentType && contentType.includes("text/html"))) {
            const errorText = await response.text();
            console.error("🔴 Server returned an HTML error page instead of JSON:", errorText);
            throw new Error(`Server responded with status ${response.status}. Check your backend console logs.`);
          }

          const result = await response.json();

          setChatHistory(prev => [...prev, { 
            sender: 'ai', 
            text: `🏆 Success! Your requirement profile has been automatically qualified as a verified CRM entry. Assigned Lead ID: ${result.lead?.id || 'ITO-NEW'}. A field executive will map down a custom quotation shortly.` 
          }]);

        } catch (err) {
          console.error("Forensic AI Ingestion Failure Details:", err.message);
          setChatHistory(prev => [...prev, { 
            sender: 'ai', 
            text: `⚠️ Database Sync Bottleneck: ${err.message}` 
          }]);
        } finally { // ✅ FIXED: Cleared the stray 'font-semibold' text string successfully
          setIsProcessing(false);
        }
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-xs">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white font-black px-4 py-3 rounded-full shadow-2xl border border-slate-800 flex items-center gap-2 hover:bg-slate-800 transition-all uppercase tracking-wider animate-bounce"
        >
          🤖 Chat with AI Agent
        </button>
      ) : (
        <div className="w-80 h-96 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-slate-300">
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-black text-white uppercase tracking-wide">ITO Digital Assistant</div>
              <div className="text-[9px] text-emerald-400 font-mono mt-0.5">● Live Lead Qualifier Stream</div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white text-sm font-bold">×</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-medium scrollbar-thin scrollbar-thumb-slate-800">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded text-justify leading-relaxed ${msg.sender === 'user' ? 'bg-amber-500 text-slate-950 font-bold font-mono' : 'bg-slate-900 text-slate-100 border border-slate-800/60'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-2 bg-slate-900 border-t border-slate-800 flex gap-1.5">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isProcessing}
              placeholder={isProcessing ? "AI processing logs..." : "Type data string details here..."}
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 focus:outline-none focus:border-amber-500 text-white font-mono"
            />
            <button 
              type="submit" 
              disabled={isProcessing}
              className="bg-amber-500 text-slate-950 font-black uppercase px-3 py-1.5 rounded hover:bg-amber-600 disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}