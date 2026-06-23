// components/Footer.js
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Identity Section */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wide mb-3">INDIA TRADE OVERSEAS</h4>
          <p className="leading-relaxed text-slate-400">
            Digital business platform handling corporate acquisition and secure bulk supply chains.
          </p>
        </div>

        {/* Quick Product Navigation */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wide mb-3">PRODUCT SECTORS</h4>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/public/stone" className="hover:text-amber-400 transition-colors">Stone Aggregates</Link>
            <Link href="/public/coal" className="hover:text-amber-400 transition-colors">Coal Sourcing</Link>
            <Link href="/public/tea" className="hover:text-amber-400 transition-colors">Tea Network</Link>
            <Link href="/public/price" className="hover:text-amber-400 transition-colors">Inquiries</Link>
          </div>
        </div>

        {/* Corporate Compliance Note */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wide mb-3">COMPLIANCE CONTROL</h4>
          <p className="leading-relaxed text-slate-500">
            This platform operates under a Zero-Trust internal architecture. Unauthorized access, bulk data exporting, or field scraping actions automatically trigger system-wide security logs.
          </p>
        </div>

      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-8 pt-6 text-center text-slate-600">
        &copy; {new Date().getFullYear()} India Trade Overseas. All rights reserved.
      </div>
    </footer>
  );
}