"use client";

import React, { useState } from 'react';
import Footer from '../../../components/Footer.js';
import ChatWidget from '../../../components/ChatWidget.js';

export default function TeaPage() {
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    mobile_raw: '',
    email_raw: '',
    quantity_required: '',
    destination_city: '',
    payment_terms: 'Advance against loading',
    delivery_terms: 'Ex-Assam Warehouse',
    message: ''
  });

  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const varieties = [
    { type: 'CTC Tea (Bulk Graded)', spec: 'Premium dust and grain runs optimized for corporate packaging requirements' },
    { type: 'Orthodox Leaf Tea', spec: 'Long-leaf aromatic whole profile processing for premium domestic lines and exports' },
    { type: 'Prakriti Brand Blends', spec: 'Pre-packaged wholesale stock distributed directly from source blending facilities' }
  ];

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
      product_category: 'tea',
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
      if (!response.ok) throw new Error(result.error || 'Server rejected submission.');

      setStatus({
        type: 'success',
        message: `Tea procurement pipeline updated. Lead Priority: ${result.data.priority}.`
      });

      setFormData({
        customer_name: '', company_name: '', mobile_raw: '', email_raw: '',
        quantity_required: '', destination_city: '',
        payment_terms: 'Advance against loading', delivery_terms: 'Ex-Assam Warehouse', message: ''
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Network issue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <nav className="bg-slate-900 text-white py-6 border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span className="font-mono text-xs tracking-widest text-slate-400">
            <a href="/" className="hover:text-amber-400">← MAIN HUB</a> / SECTORS
          </span>
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Tea Division</span>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Tea Distribution & Networks</h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Managing wholesale distribution models for fine Assam tea leaves and custom blends, fully integrated with freight logistics.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 font-mono text-xs tracking-wider uppercase font-bold">
              Product Blends & Logistics Slicing
            </div>
            <div className="divide-y divide-slate-100">
              {varieties.map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                  <h3 className="text-sm font-bold text-slate-900">{item.type}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.spec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded shadow-sm p-6 sticky top-28">
            <h2 className="text-lg font-black text-slate-900 uppercase border-b pb-3 mb-6 tracking-wide">Request Inventory Quote</h2>
            
            {status.message && (
              <div className={`p-4 rounded text-xs font-semibold mb-6 border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-500/20 text-emerald-800' : 'bg-rose-50 border-rose-500/20 text-rose-800'}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Contact Name *</label>
                  <input required type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Company Name</label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Mobile/WhatsApp *</label>
                  <input required type="tel" name="mobile_raw" value={formData.mobile_raw} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Email Address</label>
                  <input type="email" name="email_raw" value={formData.email_raw} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Volume Metric (KG) *</label>
                  <input required type="number" name="quantity_required" value={formData.quantity_required} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Destination City *</label>
                  <input required type="text" name="destination_city" value={formData.destination_city} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-3 py-2 text-sm bg-slate-50/50" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold py-3 uppercase tracking-wider rounded transition-all text-xs">
                {loading ? 'PROCESSING ASSIGNMENT...' : 'SUBMIT PACKAGING REQS'}
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