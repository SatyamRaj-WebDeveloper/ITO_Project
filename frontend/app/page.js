// frontend/app/page.js
import React from 'react';
import Link from 'next/link';
import Footer from '../components/Footer.js';
import ChatWidget from '../components/ChatWidget.js';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      
      {/* Navigation Top Header */}
      <header className="bg-slate-900 text-white h-20 flex items-center border-b border-amber-500/20 shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider">INDIA TRADE <span className="text-amber-400">OVERSEAS</span></span>
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">Digital Headquarters</span>
          </div>
          <Link 
            href="/employee" 
            className="text-xs font-bold uppercase tracking-wider border border-white/20 hover:border-amber-400 px-4 py-2 rounded text-slate-300 hover:text-amber-400 transition-all"
          >
            Workforce Portal Access
          </Link>
        </div>
      </header>

      {/* Hero Segment */}
      <main className="flex-grow">
        <section className="bg-slate-900 text-white py-24 px-4 text-center border-b-4 border-amber-500 relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-block mb-4">
              Enterprise Commodity Management
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
              Connecting Bulk Commodities To <br /> National Supply Chains
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
              Industrial grade stone aggregates, coal energy supplies, premium bulk tea distributions, and agro exports organized within a single platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="#channels" 
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 text-slate-950 font-bold uppercase text-xs tracking-wider rounded shadow hover:bg-white transition-all active:scale-95"
              >
                View Divisions
              </Link>
              <Link 
                href="/admin" 
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 text-white font-bold uppercase text-xs tracking-wider rounded border border-white/10 hover:border-amber-400 transition-all"
              >
                Executive Terminal
              </Link>
            </div>
          </div>
        </section>

        {/* Division Selection Section */}
        <section id="channels" className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Active Operation Channels</h2>
            <div className="h-1 w-8 bg-amber-500 mx-auto mt-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Stone Channel Link */}
            <div className="bg-white rounded p-6 border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between group">
              <div>
                <span className="text-amber-500 font-mono text-xs font-bold block mb-1">DIV-01</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Stone Aggregates</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  10mm, 20mm, and WMM sizes with direct logging of transport and crusher hubs.
                </p>
              </div>
              <Link href="/public/stone" className="text-xs font-bold text-slate-900 group-hover:text-amber-500 transition-colors flex items-center gap-1">
                Enter Procurement →
              </Link>
            </div>

            {/* Coal Channel Link */}
            <div className="bg-white rounded p-6 border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between group">
              <div>
                <span className="text-amber-500 font-mono text-xs font-bold block mb-1">DIV-02</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Coal Sourcing</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Industrial grade mineral logs cataloged by specific grade variations and loading points.
                </p>
              </div>
              <Link href="/public/coal" className="text-xs font-bold text-slate-900 group-hover:text-amber-500 transition-colors flex items-center gap-1">
                Enter Procurement →
              </Link>
            </div>

            {/* Tea Channel Link */}
            <div className="bg-white rounded p-6 border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between group">
              <div>
                <span className="text-amber-500 font-mono text-xs font-bold block mb-1">DIV-03</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Tea Distribution</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  CTC and Orthodox bulk supplies tracking batch requirements across corporate lines.
                </p>
              </div>
              <Link href="/public/tea" className="text-xs font-bold text-slate-900 group-hover:text-amber-500 transition-colors flex items-center gap-1">
                Enter Procurement →
              </Link>
            </div>

            {/* Price Channel Link */}
            <div className="bg-white rounded p-6 border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between group">
              <div>
                <span className="text-amber-500 font-mono text-xs font-bold block mb-1">DIV-04</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Inquiry Desk</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Capture customized bulk orders, client parameters, and upload formal requirement files.
                </p>
              </div>
              <Link href="/public/price" className="text-xs font-bold text-slate-900 group-hover:text-amber-500 transition-colors flex items-center gap-1">
                Submit Inquiry →
              </Link>
            </div>

          </div>
        </section>
      </main>
      <ChatWidget/>
      <Footer />
    </div>
  );
}