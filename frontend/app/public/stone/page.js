"use client";

import React, { useState } from 'react';
import Footer from '../../../components/Footer.js';
import ChatWidget from '../../../components/ChatWidget.js';

export default function StonePage() {
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    mobile_raw: '',
    email_raw: '',
    quantity_required: '',
    destination_city: '',
    payment_terms: 'Advance against loading',
    delivery_terms: 'Ex-Crusher Yard',
    message: ''
  });

  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const sizes = [
    { name: '10 mm Aggregates', use: 'Concrete grading & roof casting arrays' },
    { name: '20 mm Aggregates', use: 'Structural columns, beams, and infrastructure slabs' },
    { name: '40 mm Ballast', use: 'Railway ballast, foundational filling base' },
    { name: 'WMM (Wet Mix Macadam)', use: 'Sub-base construction for expressways and highways' },
    { name: 'Crusher Dust', use: 'Asphalt production and brick manufacturing rows' }
  ];

  const handlesInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    // Payload packaging formatted cleanly to match Express JSON endpoints
    const payload = {
      source: 'website',
      product_category: 'stone',
      ...formData,
      quantity_required: parseFloat(formData.quantity_required)
    };

    try {
      const response = await fetch('https://ito-backend-v3di.onrender.com/api/leads/ingest-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server rejected lead transmission.');
      }

      setStatus({
        type: 'success',
        message: `Inquiry successfully logged into CRM! Allocation Priority: ${result.data.priority}.`
      });

      // Clear layout fields upon verified processing loop
      setFormData({
        customer_name: '',
        company_name: '',
        mobile_raw: '',
        email_raw: '',
        quantity_required: '',
        destination_city: '',
        payment_terms: 'Advance against loading',
        delivery_terms: 'Ex-Crusher Yard',
        message: ''
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Network infrastructure drop.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      
      {/* Mini Simple Header */}
      <nav className="bg-slate-900 text-white py-6 border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span className="font-mono text-xs tracking-widest text-slate-400">
            <a href="/" className="hover:text-amber-400">← MAIN HUB</a> / CORE OPERATIONS
          </span>
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Stone Division</span>
        </div>
      </nav>

      {/* Main Container Core */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Product Specifications */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              Stone Aggregates Supply
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              High-durability materials processed directly through certified mining crusher plants. Outfitted with verification checkpoints to manage structural quality parameters.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 font-mono text-xs tracking-wider uppercase font-bold">
              Available Gradings & Sizing Profiles
            </div>
            <div className="divide-y divide-slate-100">
              {sizes.map((size, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{size.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{size.use}</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono uppercase font-semibold">
                    Bulk Only
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-500/20 rounded p-6 text-xs text-amber-900 leading-relaxed">
            <strong className="block text-sm font-bold text-amber-800 mb-1 uppercase tracking-wide">
              Procurement Conditions
            </strong>
            Official purchase inquiries require a matching business entity validation framework. High-volume transport requests are evaluated directly at the management dashboard deck to lock down floor margins.
          </div>
        </div>

        {/* Right Side: Lead Processing Ingestion Form */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded shadow-sm p-6 sticky top-28">
            <h2 className="text-lg font-black text-slate-900 uppercase border-b pb-3 mb-6 tracking-wide">
              Request Commercial Quote
            </h2>

            {status.message && (
              <div className={`p-4 rounded text-xs font-semibold mb-6 border ${
                status.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-500/20 text-emerald-800' 
                  : 'bg-rose-50 border-rose-500/20 text-rose-800'
              }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Contact Person *</label>
                  <input required type="text" name="customer_name" value={formData.customer_name} onChange={handlesInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-slate-50/50" placeholder="Satyam Raj" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Company Entity</label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handlesInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-slate-50/50" placeholder="ITO Corp" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Mobile/WhatsApp *</label>
                  <input required type="tel" name="mobile_raw" value={formData.mobile_raw} onChange={handlesInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-slate-50/50" placeholder="9812345678" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Email Address</label>
                  <input type="email" name="email_raw" value={formData.email_raw} onChange={handlesInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-slate-50/50" placeholder="satyam@ito.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Volume Required (MT) *</label>
                  <input required type="number" name="quantity_required" value={formData.quantity_required} onChange={handlesInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-slate-50/50" placeholder="e.g. 1500" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Destination Hub *</label>
                  <input required type="text" name="destination_city" value={formData.destination_city} onChange={handlesInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-slate-50/50" placeholder="Lucknow" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Payment Settlement Terms</label>
                  <select name="payment_terms" value={formData.payment_terms} onChange={handlesInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-slate-50/50 h-[38px]">
                    <option value="Advance against loading">Advance against loading</option>
                    <option value="50% Advance / 50% Delivery">50% Advance / 50% Delivery</option>
                    <option value="LC Settlement Gate">LC Settlement Gate</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Logistics Framework</label>
                  <select name="delivery_terms" value={formData.delivery_terms} onChange={handlesInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-slate-50/50 h-[38px]">
                    <option value="Ex-Crusher Yard">Ex-Crusher Yard</option>
                    <option value="FOR Destination Base">FOR Destination Base</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Additional Logistics Directives</label>
                <textarea rows="3" name="message" value={formData.message} onChange={handlesInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-slate-50/50" placeholder="Specify loading site timelines or vehicle fleet restrictions..."></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold py-3 uppercase tracking-wider rounded transition-all disabled:opacity-50 active:scale-[0.99] mt-2 text-xs"
              >
                {loading ? 'TRANSMITTING REQS...' : 'SUBMIT DIRECT TO PIPELINE'}
              </button>

            </form>
          </div>
        </div>

      </main>
      <ChatWidget />
      <Footer />
    </div>
  );
}