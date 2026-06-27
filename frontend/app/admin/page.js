"use client";

import React, { useState, useEffect } from 'react';

export default function AdminCommandCenter() {
  // --- AUTHENTICATION & SESSION STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ employee_id: '', password: '', device_signature: 'FOUNDER-DESK-SECURE' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // --- VIEW TOGGLE STATE ---
  const [currentView, setCurrentView] = useState('AUDIT_LOGS'); // 'AUDIT_LOGS', 'GLOBAL_LEADS', 'PROVISION_STAFF'

  // --- DATA LIST TRACKERS ---
  const [auditLogs, setAuditLogs] = useState([]);
  const [globalLeads, setGlobalLeads] = useState([]);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // --- STAFF PROVISIONING STATE HANDLERS ---
  const [provisionForm, setProvisionForm] = useState({
    full_name: '',
    department: 'stone',
    role: 'executive',
    temporary_password: ''
  });
  const [provisionStatus, setProvisionStatus] = useState({ type: null, message: '' });
  const [provisionLoading, setProvisionLoading] = useState(false);

  // Check for active admin session on layout mount
  useEffect(() => {
    const token = localStorage.getItem('ito_admin_token');
    const profile = localStorage.getItem('ito_admin_profile');
    if (token && profile) {
      const user = JSON.parse(profile);
      if (user.role === 'super_admin') {
        setIsAuthenticated(true);
        fetchGlobalMasterData(token);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleProvisionFormChange = (e) => {
    const { name, value } = e.target;
    setProvisionForm(prev => ({ ...prev, [name]: value }));
  };

  // Authenticates credentials against your Node.js Express server backend
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch('https://ito-backend-v3di.onrender.com/api/auth/login-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Access Denied. Insufficient organizational clearances.');
      }

      if (result.user.role !== 'super_admin') {
        throw new Error('Access Denied. Only the Founder/Super Admin can unlock this terminal.');
      }

      localStorage.setItem('ito_admin_token', result.token);
      localStorage.setItem('ito_admin_profile', JSON.stringify(result.user));

      setIsAuthenticated(true);
      fetchGlobalMasterData(result.token);
    } catch (err) {
      setLoginError(err.message || 'Authentication framework communication error.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Synchronously pulls both pipelines down from backend channels
  const fetchGlobalMasterData = async (token = null) => {
    setStreamLoading(true);
    setStreamError('');
    const activeToken = token || localStorage.getItem('ito_admin_token');

    try {
      // 1. Fetch Security Audit Trails Ledger
      const auditResponse = await fetch('https://ito-backend-v3di.onrender.com/api/security/audit-stream', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });
      const auditResult = await auditResponse.json();
      if (auditResponse.ok) setAuditLogs(auditResult);

      // 2. Fetch Global Customer Procurement Requirements Pipeline List
      const leadsResponse = await fetch('https://ito-backend-v3di.onrender.com/api/leads/workspace-board', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });
      const leadsResult = await leadsResponse.json();
      if (leadsResponse.ok) setGlobalLeads(leadsResult);

    } catch (err) {
      setStreamError(err.message || 'Operational metrics stream sync degraded.');
    } finally {
      setStreamLoading(false);
    }
  };

  // Handles transmission of new employee properties to Express backend pipelines
  const handleStaffProvisionSubmit = async (e) => {
    e.preventDefault();
    setProvisionLoading(true);
    setProvisionStatus({ type: null, message: '' });
    const token = localStorage.getItem('ito_admin_token');

    try {
      const response = await fetch('https://ito-backend-v3di.onrender.com/api/admin/provision-employee', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(provisionForm)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Provisional allocation rejected by database rules.');
      }

      setProvisionStatus({
        type: 'success',
        message: `✓ Success! Profile initialized. Generated Corporate ID: ${result.user.employee_id}`
      });

      setProvisionForm({ full_name: '', department: 'stone', role: 'executive', temporary_password: '' });
      fetchGlobalMasterData(token); // Sync tables
    } catch (err) {
      setProvisionStatus({ type: 'error', message: err.message || 'Provisional network assignment drop.' });
    } finally {
      setProvisionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ito_admin_token');
    localStorage.removeItem('ito_admin_profile');
    setIsAuthenticated(false);
    setCredentials({ employee_id: '', password: '', device_signature: 'FOUNDER-DESK-SECURE' });
  };


  // --- VIEW INTERFACE 1: SECURE COMMAND GATEWAY LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-xs">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

          <div className="text-center mb-6">
            <h1 className="text-lg font-black text-white tracking-widest uppercase">
              FOUNDER TERMINAL <span className="text-amber-500">GATEWAY</span>
            </h1>
            <p className="text-[9px] uppercase font-mono tracking-widest text-slate-500 mt-1">
              Root Level Cryptographic Security Authorization Required
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded font-semibold mb-4">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 font-semibold text-slate-400">
            <div>
              <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Administrative ID *</label>
              <input
                required type="text" name="employee_id" value={credentials.employee_id} onChange={handleInputChange}
                className="w-full border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 bg-slate-950 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                placeholder="e.g. ITO-FOUNDER-01"
              />
            </div>

            <div>
              <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Master Authorization Pass *</label>
              <input
                required type="password" name="password" value={credentials.password} onChange={handleInputChange}
                className="w-full border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 bg-slate-950 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit" disabled={loginLoading}
              className="w-full bg-amber-500 text-slate-950 font-bold py-3 uppercase tracking-wider rounded transition-all active:scale-[0.99] mt-2 border border-transparent hover:bg-amber-600"
            >
              {loginLoading ? 'DECRYPTING SEGMENTS...' : 'AUTHORIZE EX-COMMAND ENTRY'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RUNTIME INLINE EVALUATIONS (Executes safely after Auth Gate guarantees state availability) ---
  const filteredLogs = filterType === 'ALL'
    ? auditLogs
    : auditLogs.filter(log => log.action_type === filterType);

  const indexOfLastLog = currentPage * entriesPerPage;
  const indexOfFirstLog = indexOfLastLog - entriesPerPage;
  const currentLogsSubset = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

  // --- VIEW INTERFACE 2: THE OPERATING MATRIX WORKSPACE ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">

      {/* Console Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-md font-black tracking-wider uppercase text-white flex items-center gap-2">
            🛡️ FOUNDER OPERATING COMMAND DECK
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono px-2 py-0.5 rounded-full uppercase">Super Admin Matrix</span>
          </h1>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">Live Relational Footprint Streams & Data Loss Monitoring Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchGlobalMasterData()}
            className="bg-slate-950 hover:bg-slate-800 text-xs font-mono border border-slate-700 px-3 py-2 rounded transition-colors text-slate-300"
          >
            🔄 Sync Streams
          </button>
          <button onClick={handleLogout} className="bg-rose-950/40 hover:bg-rose-900/60 text-xs font-mono border border-rose-800/50 text-rose-400 px-3 py-2 rounded transition-colors">
            Shutdown Terminal
          </button>
        </div>
      </header>

      {/* Main Container Grid Layout */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Metric Cards Segment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-col justify-between">
            <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Total Monitored Footprints</span>
            <span className="text-2xl font-black text-white tracking-tight mt-1">{auditLogs.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-col justify-between">
            <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">Data Unmask Events</span>
            <span className="text-2xl font-black text-amber-400 tracking-tight mt-1">
              {auditLogs.filter(l => ['MOBILE_REVEAL', 'EMAIL_REVEAL'].includes(l.action_type)).length}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-col justify-between">
            <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">AI Lead Ingestions</span>
            <span className="text-2xl font-black text-emerald-400 tracking-tight mt-1">
              {globalLeads.length}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-col justify-between">
            <span className="text-slate-500 font-mono uppercase tracking-wider text-[10px]">System Intrusion Blocks</span>
            <span className="text-2xl font-black text-rose-400 tracking-tight mt-1">
              {auditLogs.filter(l => l.action_type === 'LOGIN_FAILED' || l.action_type === 'UNAUTHORIZED_VIEW').length}
            </span>
          </div>
        </div>

        {/* Primary View Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => { setCurrentView('AUDIT_LOGS'); setFilterType('ALL'); setCurrentPage(1); }}
            className={`pb-3 transition-all ${currentView === 'AUDIT_LOGS' ? 'border-b-2 border-amber-500 text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🛡️ Compliance Audit Ledger
          </button>
          <button
            onClick={() => { setCurrentView('GLOBAL_LEADS'); setCurrentPage(1); }}
            className={`pb-3 transition-all ${currentView === 'GLOBAL_LEADS' ? 'border-b-2 border-amber-500 text-amber-400 font-black' : 'text-slate-400 hover:text-white'}`}
          >
            📊 Enterprise Leads Master Pipeline
          </button>
          <button
            onClick={() => setCurrentView('PROVISION_STAFF')}
            className={`pb-3 transition-all ${currentView === 'PROVISION_STAFF' ? 'border-b-2 border-amber-500 text-amber-400 font-black' : 'text-slate-400 hover:text-white'}`}
          >
            👤 Provision Staff
          </button>
        </div>

        {/* --- CONTAINER WORKSPACE VIEW CARD BOX --- */}
        <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden">

          {/* TAB VIEW 1: SECURITY COMPLIANCE REGISTRY TABLE */}
          {currentView === 'AUDIT_LOGS' && (
            <div>
              <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold">
                <span className="text-white uppercase tracking-wider">Pristine Security Compliance Registry</span>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                  {['ALL', 'MOBILE_REVEAL', 'EMAIL_REVEAL', 'AI_LEAD_CREATED', 'LOGIN_SUCCESS', 'LOGIN_FAILED'].map((type) => (
                    <button
                      key={type} onClick={() => { setFilterType(type); setCurrentPage(1); }}
                      className={`px-2 py-1 rounded transition-colors ${filterType === type ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto text-xs font-mono">
                {streamLoading ? (
                  <div className="p-12 text-center text-slate-500">Streaming registries from cloud dataset pools...</div>
                ) : auditLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-600">No active system events found in database.</div>
                ) : filteredLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-600">No active system events matched the filter constraints.</div>
                ) : (
                  <>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/20 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Action Event</th>
                          <th className="p-4">Operator Identity</th>
                          <th className="p-4">Inbound Net IP</th>
                          <th className="p-4">Platform Hardware Metadata</th>
                          <th className="p-4">Administrative Action Panel Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {currentLogsSubset.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-950/30 transition-colors">
                            <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${['MOBILE_REVEAL', 'EMAIL_REVEAL'].includes(log.action_type) ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                                  log.action_type === 'AI_LEAD_CREATED' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                                    log.action_type === 'LOGIN_SUCCESS' ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20' :
                                      'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                                }`}>
                                {log.action_type}
                              </span>
                            </td>
                            <td className="p-4 text-slate-200">
                              {log.full_name ? `${log.full_name} (${log.employee_id})` : <span className="text-slate-600">Public Link / System</span>}
                            </td>
                            <td className="p-4 text-slate-400">{log.ip_address}</td>
                            <td className="p-4 text-slate-500 max-w-xs truncate" title={log.device_metadata}>{log.device_metadata}</td>
                            <td className="p-4 flex items-center gap-2">
                              {log.actor_id && ['MOBILE_REVEAL', 'EMAIL_REVEAL'].includes(log.action_type) ? (
                                <>
                                  <button
                                    onClick={async () => {
                                      const confirmAction = window.confirm(`Confirm explicit override configuration: Permanently SUSPEND employee registry account connection context?`);
                                      if (!confirmAction) return;

                                      const token = localStorage.getItem('ito_admin_token');
                                      try {
                                        const res = await fetch(`https://ito-backend-v3di.onrender.com/api/admin/user-access/${log.actor_id}`, {
                                          method: 'POST',
                                          headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                          },
                                          body: JSON.stringify({ action_type: 'LOCK' })
                                        });
                                        const out = await res.json();
                                        if (res.ok) {
                                          alert(`🛡️ Compliance Action Applied: Profile Status Terminated Permanently.`);
                                          fetchGlobalMasterData(token); // Reload admin command tables
                                        } else {
                                          alert(`Error: ${out.error}`);
                                        }
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className="bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 text-rose-400 font-mono text-[10px] px-2 py-1 rounded transition-all tracking-wider uppercase font-bold"
                                  >
                                    🔒 Lock Profile
                                  </button>

                                  <button
                                    onClick={async () => {
                                      const confirmAction = window.confirm(`Reinstate credentials access permissions clearances for this worker context?`);
                                      if (!confirmAction) return;

                                      const token = localStorage.getItem('ito_admin_token');
                                      try {
                                        const res = await fetch(`https://ito-backend-v3di.onrender.com/api/admin/user-access/${log.actor_id}`, {
                                          method: 'POST',
                                          headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                          },
                                          body: JSON.stringify({ action_type: 'UNLOCK' })
                                        });
                                        if (res.ok) {
                                          alert(`✓ Compliance Action Restored: Profile Cleared and Re-Activated.`);
                                          fetchGlobalMasterData(token);
                                        }
                                      } catch (err) {
                                        console.error(err);
                                      }
                                    }}
                                    className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] px-2 py-1 rounded transition-all tracking-wider uppercase"
                                  >
                                    🔓 Reactivate
                                  </button>
                                </>
                              ) : (
                                <span className="text-slate-600 italic text-[10px]">No Overrides Required</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Nav Footer */}
                    <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Showing {indexOfFirstLog + 1} - {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} Records</span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className="px-3 py-1 bg-slate-950 border border-slate-800 rounded disabled:opacity-30 hover:text-white transition-colors"
                        >
                          ◀ Previous
                        </button>
                        <span className="text-slate-300 font-bold">Page {currentPage} of {totalPages || 1}</span>
                        <button
                          disabled={currentPage === totalPages || totalPages === 0}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className="px-3 py-1 bg-slate-950 border border-slate-800 rounded disabled:opacity-30 hover:text-white transition-colors"
                        >
                          Next ▶
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB VIEW 2: GLOBAL ENTERPRISE LEADS PIPELINE TABLE */}
          {currentView === 'GLOBAL_LEADS' && (
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-white font-black text-sm uppercase tracking-wide">Inbound Requisition Pool</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Real-time visibility into all unassigned web and AI customer traffic pools across divisions.</p>
              </div>

              <div className="overflow-x-auto text-xs font-mono">
                {streamLoading ? (
                  <div className="p-12 text-center text-slate-500">Syncing lead master registries...</div>
                ) : globalLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-600">No public customer forms have been logged into the database yet.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Operational Sector</th>
                        <th className="p-4">Volume Required</th>
                        <th className="p-4">Destination Hub</th>
                        <th className="p-4">Pipeline Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {globalLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-950/20 transition-colors">
                          <td className="p-4 font-sans">
                            <div className="font-bold text-white text-sm">{lead.customer_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.company_name || 'Individual Operator'}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-slate-950 text-amber-400 border border-amber-500/20 font-mono text-[10px] uppercase font-bold rounded">
                              {lead.product_category}
                            </span>
                          </td>
                          <td className="p-4 text-white text-sm font-bold">{parseFloat(lead.quantity_required).toLocaleString()} MT</td>
                          <td className="p-4 text-slate-400 font-sans font-semibold">{lead.destination_city}</td>
                          <td className="p-4">
                            <select
                              value={lead.status || "New Lead"}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                const token = localStorage.getItem('ito_admin_token');
                                try {
                                  const res = await fetch(`https://ito-backend-v3di.onrender.com/api/leads/${lead.id}/status`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ status: newStatus })
                                  });
                                  if (res.ok) {
                                    fetchGlobalMasterData(token);
                                  }
                                } catch (err) {
                                  console.error("Pipeline switch error:", err);
                                }
                              }}
                              className="bg-slate-950 text-[11px] font-mono font-bold text-slate-300 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-amber-500 h-[28px]"
                            >
                              <option value="New Lead">🆕 New Lead</option>
                              <option value="Lead Qualification">⚖️ Qualification</option>
                              <option value="Follow-Up">📞 Follow-Up</option>
                              <option value="Order Confirmed">🤝 Confirmed</option>
                              <option value="Closed Won">🏆 Closed Won</option>
                              <option value="Closed Lost">❌ Closed Lost</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB VIEW 3: CORPORATE STAFF PROVISIONING CONTROL INTERFACE */}
          {currentView === 'PROVISION_STAFF' && (
            <div className="p-6 max-w-xl mx-auto text-xs">
              <div className="mb-6 border-b border-slate-800 pb-4">
                <h2 className="text-white font-black uppercase text-sm tracking-wide">Initialize Staff Credentials</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Generates organizational system identifiers and cryptographically salts passwords natively.</p>
              </div>

              {provisionStatus.message && (
                <div className={`p-4 rounded font-mono font-semibold mb-6 border ${provisionStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                  {provisionStatus.message}
                </div>
              )}

              <form onSubmit={handleStaffProvisionSubmit} className="space-y-4 font-semibold text-slate-400">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Employee Full Name *</label>
                  <input
                    required type="text" name="full_name" value={provisionForm.full_name} onChange={handleProvisionFormChange}
                    className="w-full border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 bg-slate-950 focus:outline-none focus:border-amber-500 font-sans font-medium"
                    placeholder="Satyam Raj"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Operational Sector *</label>
                    <select name="department" value={provisionForm.department} onChange={handleProvisionFormChange} className="w-full border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 bg-slate-950 focus:outline-none focus:border-amber-500 h-[38px] font-mono">
                      <option value="stone">Stone Division</option>
                      <option value="coal">Coal Terminal</option>
                      <option value="tea">Bulk Tea Network</option>
                      <option value="rice">Rice Export</option>
                      <option value="transport">Logistics Fleet</option>
                      <option value="accounts">Finance Ledger</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Clearance Authority Level *</label>
                    <select name="role" value={provisionForm.role} onChange={handleProvisionFormChange} className="w-full border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 bg-slate-950 focus:outline-none focus:border-amber-500 h-[38px] font-mono">
                      <option value="executive">Field Executive</option>
                      <option value="manager">Sector Manager</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 uppercase tracking-wider text-slate-500 text-[10px]">Temporary Password *</label>
                  <input
                    required type="text" name="temporary_password" value={provisionForm.temporary_password} onChange={handleProvisionFormChange}
                    className="w-full border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 bg-slate-950 focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="e.g. TempPass2026!x"
                  />
                </div>

                <div className="bg-slate-950 p-4 border border-slate-800 rounded font-mono text-[11px] text-slate-500 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold block mb-1">Live Allocation Mapping Preview:</span>
                  <div>Target ID String: <span className="text-slate-300 font-bold">ITO-{provisionForm.department.toUpperCase()}-{new Date().getFullYear()}-XXX</span></div>
                  <div>Access Clearances: <span className="text-slate-300 capitalize">{provisionForm.role}</span> authority inside <span className="text-slate-300 capitalize">{provisionForm.department}</span> division queue.</div>
                </div>

                <button
                  type="submit" disabled={provisionLoading}
                  className="w-full bg-amber-500 text-slate-950 font-bold py-3 uppercase tracking-wider rounded transition-colors text-xs font-sans hover:bg-amber-600 disabled:opacity-40"
                >
                  {provisionLoading ? 'SALTING SYSTEM STRINGS...' : 'INITIALIZE CORPORATE RECORD'}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}