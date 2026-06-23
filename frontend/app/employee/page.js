"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeLoginPage() {
  const [credentials, setCredentials] = useState({
    employee_id: '',
    password: '',
    device_signature: 'DESKTOP-ITO-WORKSTATION-MAIN'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Authentication denied.');
      }

      // 🧹 SAFEGUARD: Clean up stale admin session contexts to prevent cross-token bugs
      localStorage.removeItem('ito_admin_token');
      localStorage.removeItem('ito_admin_profile');

      // ✅ FIXED: Save explicit workforce token parameters matching dashboard lookup logic
      localStorage.setItem('ito_staff_token', result.token);
      localStorage.setItem('ito_user_profile', JSON.stringify(result.user));

      if (result.user.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err) {
      setError(err.message || 'System verification link degraded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-950 border border-slate-800 p-8 rounded shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
        <div className="text-center">
          <h1 className="text-xl font-black text-white tracking-widest uppercase">
            INDIA TRADE <span className="text-amber-500">OVERSEAS</span>
          </h1>
          <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mt-1">
            Internal Operations Framework Gateway
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold text-slate-400">
          <div>
            <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Workforce Employee ID *</label>
            <input required type="text" name="employee_id" value={credentials.employee_id} onChange={handleInputChange} className="w-full border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 bg-slate-900/50 focus:outline-none focus:border-amber-500 transition-colors font-mono" placeholder="e.g. ITO-FOUNDER-01" />
          </div>
          <div>
            <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Access Password *</label>
            <input required type="password" name="password" value={credentials.password} onChange={handleInputChange} className="w-full border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 bg-slate-900/50 focus:outline-none focus:border-amber-500 transition-colors font-mono" placeholder="••••••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 font-bold py-3 uppercase tracking-wider rounded transition-all text-xs border border-slate-700 hover:border-transparent active:scale-[0.99] mt-2">
            {loading ? 'RUNNING SECURITY CHECKS...' : 'VERIFY IDENTITY & CONNECT'}
          </button>
        </form>

        <div className="border-t border-slate-900 pt-4 mt-6">
          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded text-[11px] leading-relaxed text-slate-500 text-justify">
            <strong className="block text-amber-500 font-bold mb-1 uppercase text-center tracking-wide font-mono text-xs">
              Confidentiality Notice
            </strong>
            This system is the property of India Trade Overseas[cite: 1]. Unauthorized access, data copying, screenshot sharing, or any misuse of company information is strictly prohibited.
          </div>
        </div>
      </div>
    </div>
  );
}