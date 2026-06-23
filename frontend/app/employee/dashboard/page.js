"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeDashboard() {
  const [leads, setLeads] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealedFields, setRevealedFields] = useState({}); // Tracks unmasked lookups dynamically
  const router = useRouter();

  useEffect(() => {
    // Strict isolation setup: pull the clear employee keys exclusively
    const token = localStorage.getItem('ito_staff_token');
    const profile = localStorage.getItem('ito_user_profile'); // ✅ Pointed to workforce profile key

    if (!token || !profile) {
      router.push('/employee'); // Kick back to gateway login if session context is empty
      return;
    }

    const user = JSON.parse(profile);
    setUserProfile(user);
    fetchCRMWorkspaceBoard(token);
  }, []);

  // Fetches CRM dataset pipeline matching active role permissions
  const fetchCRMWorkspaceBoard = async (token) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/leads/workspace-board', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to pull board data.');

      setLeads(result);
    } catch (err) {
      setError(err.message || 'Error syncing with sales pipeline.');
    } finally {
      setLoading(false);
    }
  };

  // Triggers secure async lookup request and logs audit record before display
  const handleUnmaskRequest = async (leadId, fieldType) => {
    const token = localStorage.getItem('ito_staff_token');
    const fieldLabel = fieldType === 'phone' ? 'MOBILE NUMBER' : 'OFFICIAL EMAIL ADDRESS';

    // 1. Force the Corporate Compliance Warning Dialogue Pop-up
    const confirmProceed = window.confirm(
      `⚠️ ORGANIZATIONAL SECURITY WARNING DIRECTIVE:\n\n` +
      `You are about to unmask protected client ${fieldLabel} properties.\n\n` +
      `This action will instantly log a forensic lookup signature containing your profile ID, network IP address, and device footprint under the Founder's Compliance Ledger. \n\n` +
      `Do you possess explicit clearance to view this data?`
    );

    if (!confirmProceed) return; // Terminate execution instantly if the employee cancels

    try {
      // Connected to actual backend endpoint routing architecture
      const response = await fetch(`http://localhost:5000/api/leads/${leadId}/reveal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field_to_reveal: fieldType === 'phone' ? 'mobile' : 'email' })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Clearance validation fault.');

      // Update local state dynamically to replace the masked string with the decrypted value from the server
      setRevealedFields(prev => ({
        ...prev,
        [`${leadId}-${fieldType}`]: result.revealed_data // Syncs with controller's returning key
      }));
    } catch (err) {
      alert(`Access Denied: ${err.message}`);
    }
  };

  // ✅ Added missing handleLogout function smoothly right before the loading block
  const handleLogout = () => {
    localStorage.removeItem('ito_admin_token');
    localStorage.removeItem('ito_staff_token');
    localStorage.removeItem('ito_user_profile'); 
    router.push('/employee');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-500">
        Streaming secure CRM data matrix parameters...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-xs font-semibold text-slate-700 selection:bg-amber-500 selection:text-slate-950">

      {/* Upper Operational Control Panel Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/10 shadow-md">
        <div>
          <h1 className="text-sm font-black tracking-wider uppercase text-white">
            💼 Operational Sales Pipeline Dashboard
          </h1>
          {userProfile && (
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Active Session: <span className="text-amber-400 font-bold">{userProfile.full_name || userProfile.name}</span> | Role: <span className="uppercase text-slate-300 font-bold">{userProfile.role}</span> {userProfile.department !== 'admin' && `| Dept: ${userProfile.department.toUpperCase()}`}
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 font-mono border border-slate-700 hover:border-rose-900/40 px-3 py-1.5 rounded text-[11px] transition-all"
        >
          Terminate Session Context
        </button>
      </header>

      {/* Main CRM Board Table Workspace Grid */}
      <main className="p-6 max-w-7xl mx-auto space-y-4">

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded font-semibold">
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-slate-900 uppercase font-black tracking-wide text-[11px]">Assigned Commodity Requirements</h2>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">{leads.length} Total Records</span>
          </div>

          <div className="overflow-x-auto">
            {leads.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                No active buyer lead entries assigned to this terminal context.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-4">Client Detail / Entity</th>
                    <th className="p-4">Commodity Channel</th>
                    <th className="p-4">Requested Volume</th>
                    <th className="p-4">Secure Contact Information</th>
                    <th className="p-4">Destination Hub</th>
                    <th className="p-4">Status Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {leads.map((lead) => {
                    const phoneKey = `${lead.id}-phone`;
                    const emailKey = `${lead.id}-email`;
                    const isPhoneRevealed = revealedFields[phoneKey];
                    const isEmailRevealed = revealedFields[emailKey];

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{lead.customer_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lead.company_name || 'Individual Operator'}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-900 text-amber-400 border border-amber-500/20 font-mono text-[10px] uppercase font-bold rounded">
                            {lead.product_category}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-900 text-sm">
                          {parseFloat(lead.quantity_required).toLocaleString()} MT
                        </td>
                        <td className="p-4 space-y-1.5 font-mono text-[11px]">

                          {/* Phone Field Block */}
                          <div className="flex items-center gap-2 h-[24px]">
                            <span className="text-slate-400 uppercase text-[9px] w-10 font-sans font-bold">Mob:</span>
                            {isPhoneRevealed ? (
                              <span className="text-slate-900 font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                                {isPhoneRevealed}
                              </span>
                            ) : (
                              <>
                                <span className="text-slate-300 select-none tracking-wider font-bold">
                                  XXXXX-{lead.mobile_raw?.slice(-4) || 'XXXX'}
                                </span>
                                <button
                                  onClick={() => handleUnmaskRequest(lead.id, 'phone')}
                                  className="text-[9px] bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 text-amber-800 hover:text-slate-950 px-1.5 py-0.5 rounded transition-all uppercase font-sans font-black tracking-wider"
                                >
                                  Reveal
                                </button>
                              </>
                            )}
                          </div>

                          {/* Email Field Block */}
                          <div className="flex items-center gap-2 h-[24px]">
                            <span className="text-slate-400 uppercase text-[9px] w-10 font-sans font-bold">Mail:</span>
                            {isEmailRevealed ? (
                              <span className="text-slate-900 font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                {isEmailRevealed}
                              </span>
                            ) : lead.email_raw ? (
                              <>
                                <span className="text-slate-300 select-none italic font-medium">
                                  {lead.email_raw?.split('@')[0].slice(0, 3)}••••@•••.com
                                </span>
                                <button
                                  onClick={() => handleUnmaskRequest(lead.id, 'email')}
                                  className="text-[9px] bg-slate-100 hover:bg-slate-900 border border-slate-200 text-slate-600 hover:text-white px-1.5 py-0.5 rounded transition-all uppercase font-sans font-black tracking-wider"
                                >
                                  Reveal
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-300 italic font-medium">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-900 font-bold">{lead.destination_city}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${lead.priority === 'Hot' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            lead.priority === 'Warm' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                            {lead.priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}