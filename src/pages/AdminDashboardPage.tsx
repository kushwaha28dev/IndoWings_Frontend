import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, Trash2, CheckCircle2, 
  AlertCircle, RefreshCw, BarChart3, Truck, Package, Clock, 
  Search, Filter, MapPin, Building, Key, Activity, Loader2,
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { DeliveryUser } from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';

interface AdminDashboardPageProps {
  currentUser: DeliveryUser | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ currentUser, onNavigate, onLogout }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [drones, setDrones] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personnel' | 'overview' | 'audit'>('personnel');

  // New User Provisioning State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'fleet_manager' | 'dispatcher' | 'client'>('dispatcher');
  const [newStation, setNewStation] = useState('Noida Sector 62 Plant');
  const [newOrg, setNewOrg] = useState('IndoWings Enterprise Logistics');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [uRes, dRes, oRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/delivery/users`),
        fetch(`${API_BASE_URL}/api/delivery/drones`),
        fetch(`${API_BASE_URL}/api/delivery/orders`)
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users || []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDrones(dData.drones || []);
      }
      if (oRes.ok) {
        const oData = await oRes.json();
        setOrders(oData.orders || []);
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newRole) {
      setCreateError('Full name, email, and role are mandatory');
      return;
    }

    setCreatingUser(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          role: newRole,
          station: newStation,
          organization: newOrg
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to provision user');
        return;
      }

      setCreateSuccess(`User ${newName} provisioned with ID ${data.user?.id}!`);
      setTimeout(() => {
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        setCreateSuccess('');
      }, 1500);
      fetchData();
    } catch {
      setCreateError('Server connection error');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove ${name}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phone || '').includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const qcPassedDrones = drones.filter(d => d.qc_status === 'passed').length;
  const inTransitDispatches = orders.filter(o => ['in-flight', 'dispatched', 'approaching'].includes(o.status)).length;
  const deliveredDrones = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white shadow-md">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">Super Admin Command</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Global Operations
                </span>
              </div>
              <p className="text-xs text-slate-400">IndoWings Drone Fleet & Asset Provisioning</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Global Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-300 font-semibold">{currentUser?.name || 'Puneet Kushwaha'}</span>
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Total Personnel</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-slate-900">{users.length}</p>
            <p className="text-xs text-slate-500 mt-1">4 Active Operations Roles</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">QC Certified Units</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-slate-900">{qcPassedDrones}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Ready for Corridor Dispatch</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">In-Transit Dispatches</span>
              <Truck className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-3xl font-black text-slate-900">{inTransitDispatches}</p>
            <p className="text-xs text-sky-600 font-medium mt-1">Active Drone Shipments</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Delivered to Clients</span>
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-black text-slate-900">{deliveredDrones}</p>
            <p className="text-xs text-indigo-600 font-medium mt-1">Handovers Completed</p>
          </div>
        </div>

        {/* Tab Header & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('personnel')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'personnel' ? 'bg-[#3b0080] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              👥 Personnel Provisioning
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-[#3b0080] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              📊 Global Fleet Logistics
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision New User ID</span>
          </button>
        </div>

        {activeTab === 'personnel' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search personnel by name, email, or mobile..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Super Admin</option>
                  <option value="fleet_manager">Fleet Manager</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="client">Client / Receiving</option>
                </select>
              </div>
            </div>

            {/* Personnel Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">User ID & Name</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Contact (Email & Mobile)</th>
                      <th className="py-3.5 px-4">Station / Base Hub</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#3b0080] font-black flex items-center justify-center text-xs">
                              {u.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                              <span className="text-[11px] font-mono text-slate-400">{u.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.role === 'admin' ? 'bg-purple-100 text-[#3b0080]' :
                            u.role === 'fleet_manager' ? 'bg-amber-100 text-amber-800' :
                            u.role === 'dispatcher' ? 'bg-sky-100 text-sky-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role === 'admin' && '👑 Admin'}
                            {u.role === 'fleet_manager' && '🛠️ Fleet Manager'}
                            {u.role === 'dispatcher' && '🚚 Dispatcher'}
                            {u.role === 'client' && '🏢 Client Officer'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="text-slate-800 font-medium">{u.email}</p>
                          <p className="text-xs text-slate-400">{u.phone || 'No phone registered'}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="text-xs font-semibold text-slate-700">{u.station || 'IndoWings Plant'}</p>
                          <p className="text-[11px] text-slate-400">{u.organization || 'IndoWings'}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {u.role !== 'admin' ? (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Deactivate Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                          No personnel matched your search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Dispatches */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between">
                <span>Active Drone Corridor Sorties</span>
                <span className="text-xs font-semibold text-purple-600">{orders.length} Total</span>
              </h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{o.id}</p>
                      <p className="text-xs text-slate-400">{o.destination_address || o.delivery_address || 'Client Airbase'}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-slate-100 text-slate-700">
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drone Stock & QC Readiness */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center justify-between">
                <span>Drone Hardware Fleet Status</span>
                <span className="text-xs font-semibold text-emerald-600">{qcPassedDrones} QC Passed</span>
              </h3>
              <div className="space-y-3">
                {drones.slice(0, 5).map(d => (
                  <div key={d.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{d.model} ({d.serial_number || d.id})</p>
                      <p className="text-xs text-slate-400">{d.current_city} · Battery: {d.battery}%</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${d.qc_status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {d.qc_status || 'Pending QC'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Provision New User ID */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Provision Personnel ID</h3>
                  <p className="text-xs text-slate-500">Assign role and station access to employee/client</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Major Vikram Rathore"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Work Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="officer@indowings.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Mobile Phone (10 digits)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Assigned Operational Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="dispatcher">🚚 Dispatcher (Schedules & executes shipments)</option>
                  <option value="fleet_manager">🛠️ Fleet Manager (Drone inventory & QC clearance)</option>
                  <option value="client">🏢 Client / Receiving Officer (Accepts & inspects drones)</option>
                  <option value="admin">👑 Super Admin (Full system & user rights)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Station / Base</label>
                  <input
                    type="text"
                    value={newStation}
                    onChange={e => setNewStation(e.target.value)}
                    placeholder="e.g. Noida Plant or Northern Airbase"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">Organization</label>
                  <input
                    type="text"
                    value={newOrg}
                    onChange={e => setNewOrg(e.target.value)}
                    placeholder="e.g. Defense Logistics / IndoWings"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {createError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 font-medium">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{createSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {creatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{creatingUser ? 'Provisioning...' : 'Provision ID'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
