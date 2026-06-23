"use client";

import React, { useState } from 'react';
import Footer from '../../../components/Footer.js';
import ChatWidget from '../../../components/ChatWidget.js';

export default function PricePage() {
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    mobile_raw: '',
    email_raw: '',
    product_category: 'stone',
    quantity_required: '',
    destination_city: '',
    payment_terms: 'Advance against loading',
    delivery_terms: 'Ex-Works Hub',
    message: ''
  });

  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    const payload = {
      source: 'website',
      ...formData,
      quantity_required: parseFloat(formData.quantity_required)
    };

    try {
      const response = await fetch('http://localhost:5000/api/leads/ingest-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Server rejected lead.');

      setStatus({
        type: 'success',
        message: `Inquiry parsed and assigned. Division queue: ${formData.product_category.toUpperCase()} | Priority Tag: ${result.data.priority}.`
      });

      setFormData({
        customer_name: '', company_name: '', mobile_raw: '', email_raw: '',
        product_category: 'stone', quantity_required: '', destination_city: '',
        payment_terms: 'Advance against loading', delivery_terms: 'Ex-Works Hub', message: ''
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Transmission drop.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <nav className="bg-slate-900 text-white py-6 border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span className="font-mono text-xs tracking-widest text-slate-400">
            <a href="/" className="hover:text-amber-400">← MAIN HUB</a> / INTAKE
          </span>
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Global Inquiry Desk</span>
        </div>
      </nav>

      <main className="flex-grow max-w-xl mx-auto w-full px-4 py-12">
        <div className="bg-white border border-slate-200 rounded shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Central Procurement Logging</h1>
            <p className="text-xs text-slate-500 mt-1">Specify parameters to route data lines straight to sector managers[cite: 79, 543].</p>
          </div>

          {status.message && (
            <div className={`p-4 rounded text-xs font-semibold mb-6 border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-500/20 text-emerald-800' : 'bg-rose-50 border-rose-500/20 text-rose-800'}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Select Target Division Channel *</label>
              <select name="product_category" value={formData.product_category} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:border-amber-500 bg-slate-50 h-[38px]">
                <option value="stone">Stone Aggregates Division</option>
                <option value="coal">Coal Sourcing Terminal</option>
                <option value="tea">Bulk Tea Networks</option>
                <option value="rice">Rice & Agro Export Channel</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Client Full Name *</label>
                <input required type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
              </div>
              <div>
                <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Company Name</label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Mobile Identifier *</label>
                <input required type="tel" name="mobile_raw" value={formData.mobile_raw} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
              </div>
              <div>
                <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Email Address</label>
                <input type="email" name="email_raw" value={formData.email_raw} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Volume Metric Required *</label>
                <input required type="number" name="quantity_required" value={formData.quantity_required} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
              </div>
              <div>
                <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Target Destination Hub *</label>
                <input required type="text" name="destination_city" value={formData.destination_city} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold py-3 uppercase tracking-wider rounded transition-all text-xs">
              {loading ? 'STREAMING DATA STRINGS...' : 'INGEST INQUIRY'}
            </button>
          </form>
        </div>
      </main>
      <ChatWidget />
      <Footer />
    </div>
  );
}