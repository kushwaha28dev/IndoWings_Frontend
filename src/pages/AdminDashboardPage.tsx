import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, Trash2, CheckCircle2, 
  AlertCircle, RefreshCw, BarChart3, Truck, Package, Clock, 
  Search, Filter, MapPin, Building, Key, Activity, Loader2,
  ChevronRight, ArrowUpRight, Headphones, Radio, Plus, Check,
  X, Lock, Smartphone, Mail, Layers, Send, ChevronDown, CheckCircle
} from 'lucide-react';
import { DeliveryUser } from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';

interface AdminDashboardPageProps {
  currentUser: DeliveryUser | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ currentUser, onNavigate, onLogout }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'personnel' | 'provision' | 'fleet' | 'dispatch' | 'support'>('overview');

  // Core Data
  const [users, setUsers] = useState<any[]>([]);
  const [drones, setDrones] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [expertRequests, setExpertRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [droneFilter, setDroneFilter] = useState('all');
  const [supportFilter, setSupportFilter] = useState('all');

  // Provisioning State (Dedicated Page View - NO POPUP)
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provRole, setProvRole] = useState<'admin' | 'fleet_manager' | 'dispatcher' | 'support'>('dispatcher');
  const [provStation, setProvStation] = useState('Noida Sector 62 Assembly Plant');
  const [provOrg, setProvOrg] = useState('IndoWings Aerospace Operations');
  const [provTempPass, setProvTempPass] = useState('');
  
  // Admin Security OTP State for Provisioning
  const [adminOtpChannel, setAdminOtpChannel] = useState<'email' | 'phone'>('email');
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  const [adminOtp, setAdminOtp] = useState('');
  const [adminOtpLoading, setAdminOtpLoading] = useState(false);
  const [adminOtpError, setAdminOtpError] = useState('');
  const [provisioningSuccess, setProvisioningSuccess] = useState<any | null>(null);

  // Fleet Add State
  const [showAddSingleDrone, setShowAddSingleDrone] = useState(false);
  const [showBulkDroneModal, setShowBulkDroneModal] = useState(false);
  const [newDroneModel, setNewDroneModel] = useState('Cyberone Pro');
  const [newDroneSerial, setNewDroneSerial] = useState('');
  const [newDroneStation, setNewDroneStation] = useState('Noida Sector 62 Plant');
  const [newDroneBattery, setNewDroneBattery] = useState(100);
  const [newDronePayload, setNewDronePayload] = useState(5);
  
  // Bulk Drone Import State
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkModel, setBulkModel] = useState('Cyberone Pro');
  const [bulkPrefix, setBulkPrefix] = useState('IW-UAV-NCR');
  const [bulkStation, setBulkStation] = useState('Noida Sector 62 Plant');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // New Sortie Dispatch State
  const [showNewSortieModal, setShowNewSortieModal] = useState(false);
  const [sortieCustomer, setSortieCustomer] = useState('');
  const [sortiePickup, setSortiePickup] = useState('Noida Plant Hub');
  const [sortieDrop, setSortieDrop] = useState('');
  const [sortiePackage, setSortiePackage] = useState('Avionics Module');
  const [sortieDroneId, setSortieDroneId] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [uRes, dRes, oRes, sRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/delivery/users`),
        fetch(`${API_BASE_URL}/api/delivery/drones`),
        fetch(`${API_BASE_URL}/api/delivery/orders`),
        fetch(`${API_BASE_URL}/api/delivery/support/expert-requests`).catch(() => null)
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
      if (sRes && sRes.ok) {
        const sData = await sRes.json();
        setExpertRequests(sData.requests || []);
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

  // 1. ADMIN REQUESTS OTP TO AUTHORIZE USER CREATION
  const handleRequestAdminOtp = async () => {
    setAdminOtpLoading(true);
    setAdminOtpError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/admin/request-provision-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: currentUser?.email || 'puneet@indowings.com',
          adminPhone: currentUser?.phone || '+919999999999',
          channel: adminOtpChannel
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminOtpError(data.error || 'Failed to request authorization code');
        return;
      }
      setAdminOtpSent(true);
      showToast(`Security OTP sent to ${adminOtpChannel === 'phone' ? 'Phone' : 'Email'}!`);
    } catch {
      setAdminOtpError('Cannot connect to authorization server.');
    } finally {
      setAdminOtpLoading(false);
    }
  };

  // 2. ADMIN VERIFIES OTP & PROVISIONS NEW USER
  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName.trim() || !provEmail.trim() || !provRole) {
      setAdminOtpError('Full Name, Email, and Role are mandatory.');
      return;
    }
    if (!adminOtp.trim()) {
      setAdminOtpError('Please enter your 6-digit Admin Security OTP.');
      return;
    }
    if (!provTempPass.trim() || provTempPass.trim().length < 6) {
      setAdminOtpError('Please provide a temporary password (min 6 characters) or click Generate.');
      return;
    }

    setAdminOtpLoading(true);
    setAdminOtpError('');

    try {
      const adminTarget = adminOtpChannel === 'phone' 
        ? (currentUser?.phone || '+919999999999')
        : (currentUser?.email || 'puneet@indowings.com');

      const res = await fetch(`${API_BASE_URL}/api/delivery/admin/provision-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminTarget,
          otp: adminOtp.trim(),
          name: provName.trim(),
          email: provEmail.trim(),
          phone: provPhone.trim(),
          role: provRole,
          station: provStation,
          organization: provOrg,
          temporaryPassword: provTempPass.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminOtpError(data.error || 'Authorization failed. Please check OTP code.');
        return;
      }

      setProvisioningSuccess(data.user);
      showToast(`Personnel ID ${data.user?.id} provisioned successfully!`);
      await fetchData();
    } catch {
      setAdminOtpError('Connection error during user provisioning.');
    } finally {
      setAdminOtpLoading(false);
    }
  };

  const resetProvisioningForm = () => {
    setProvName('');
    setProvEmail('');
    setProvPhone('');
    setProvRole('dispatcher');
    setProvTempPass('');
    setAdminOtpSent(false);
    setAdminOtp('');
    setAdminOtpError('');
    setProvisioningSuccess(null);
  };

  // Delete User
  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove ${name}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        showToast(`User ${name} removed.`);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Add Single Drone
  const handleAddSingleDrone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/drones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: newDroneModel,
          serial_number: newDroneSerial || undefined,
          current_city: newDroneStation,
          battery: newDroneBattery,
          payload_kg: newDronePayload
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddSingleDrone(false);
        setNewDroneSerial('');
        showToast(`Drone ${data.drone?.id} added to fleet!`);
        await fetchData();
      }
    } catch {}
  };

  // Bulk Add Drones
  const handleBulkAddDrones = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/drones/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: bulkCount,
          model: bulkModel,
          prefix: bulkPrefix,
          current_city: bulkStation
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowBulkDroneModal(false);
        showToast(`Successfully added ${data.count} drones in bulk batch!`);
        await fetchData();
      }
    } catch {}
    finally {
      setBulkSubmitting(false);
    }
  };

  // Toggle Drone QC Status
  const handleToggleDroneQC = async (droneId: string, currentQC: string) => {
    const nextQC = currentQC === 'passed' ? 'inspection_required' : 'passed';
    try {
      await fetch(`${API_BASE_URL}/api/delivery/drones/${droneId}/qc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qc_status: nextQC,
          qc_certified_by: currentUser?.name || 'Super Admin'
        })
      });
      showToast(`Drone ${droneId} QC updated to ${nextQC}`);
      await fetchData();
    } catch {}
  };

  // Update Support Ticket Status
  const handleUpdateSupportStatus = async (ticketId: string, status: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/delivery/support/expert-requests/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showToast(`Inquiry status updated to ${status.toUpperCase()}`);
      await fetchData();
    } catch {}
  };

  // Quick Dispatch Sortie
  const handleCreateSortie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sortieDrop) {
      alert('Please specify Drop Address');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: sortieCustomer || 'Government / Defense Station',
          pickup_address: sortiePickup,
          drop_address: sortieDrop,
          package_type: sortiePackage,
          drone_id: sortieDroneId || undefined
        })
      });
      if (res.ok) {
        setShowNewSortieModal(false);
        setSortieDrop('');
        setSortieCustomer('');
        showToast('New flight sortie scheduled & dispatched!');
        await fetchData();
      }
    } catch {}
  };

  // Filtered Lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.phone || '').includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredDrones = drones.filter(d => {
    const matchesSearch = (d.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.current_city || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = droneFilter === 'all' || d.status === droneFilter || (droneFilter === 'qc_passed' && d.qc_status === 'passed');
    return matchesSearch && matchesStatus;
  });

  const qcPassedDrones = drones.filter(d => d.qc_status === 'passed').length;
  const inTransitDispatches = orders.filter(o => ['in-flight', 'dispatched', 'approaching', 'taking-off'].includes(o.status)).length;
  const deliveredDrones = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e0940] text-white px-5 py-3 rounded-2xl shadow-xl border border-purple-500/30 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container - Padded generously to stay completely clear of fixed navbar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 flex-1 w-full space-y-6">
        
        {/* ── TOP BANNER: Super Admin Identity & Status ───────────────── */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#3b0080] to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Super Admin Command Center
                </h1>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-[#3b0080] border border-purple-200">
                  Global Operations Authority
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Full Master Control
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Authorized Personnel: <strong className="text-slate-800">{currentUser?.name || 'Puneet Kushwaha'}</strong> ({currentUser?.email || 'puneet@indowings.com'}) &bull; Station: IndoWings HQ Noida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#3b0080]' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={() => {
                resetProvisioningForm();
                setActiveTab('provision');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3b0080] to-purple-600 hover:from-[#2e0066] hover:to-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision User (Dedicated)</span>
            </button>
          </div>
        </div>

        {/* ── KPI METRICS CARDS (Inspired by Reference Dashboard) ──────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Personnel</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{users.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">4 Core Roles Active</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Fleet</span>
              <Truck className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{drones.length}</p>
            <p className="text-[11px] text-sky-600 font-medium mt-0.5">Enterprise UAVs</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">QC Approved</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{qcPassedDrones}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Airworthy Cleared</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">In-Flight Sorties</span>
              <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{inTransitDispatches}</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Live Airborne Now</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{deliveredDrones}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Handovers Signed</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Support Inquiries</span>
              <Headphones className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{expertRequests.length}</p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Desk Inquiries</p>
          </div>
        </div>

        {/* ── UNIFIED MODULE TABS ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#3b0080] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Operations Radar &amp; Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('personnel')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'personnel'
                ? 'bg-[#3b0080] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personnel Directory ({users.length})</span>
          </button>

          <button
            onClick={() => {
              resetProvisioningForm();
              setActiveTab('provision');
            }}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'provision'
                ? 'bg-[#3b0080] text-white shadow-sm'
                : 'bg-purple-50 text-[#3b0080] border border-purple-200 hover:bg-purple-100/70'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>➕ Provision User (Dedicated)</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-[#3b0080] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Fleet Control ({drones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dispatch'
                ? 'bg-[#3b0080] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Dispatch &amp; Sorties ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'support'
                ? 'bg-[#3b0080] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Support Desk Power ({expertRequests.length})</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: OPERATIONS RADAR & PERFORMANCE ANALYTICS (Reference Inspired)
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Operational Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Today's Corridor Flights</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{orders.length + 8}</span>
                  <span className="text-xs font-bold text-emerald-600">98.4% on-schedule</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Average Sortie Flight Time</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">18.4</span>
                  <span className="text-sm font-bold text-slate-500">minutes / leg</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Corridor transit speed avg 58 km/h</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Airspace Safety Compliance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600">100%</span>
                  <span className="text-xs font-bold text-slate-500">DGCA NPNT Clear</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Zero corridor geo-fence violations</p>
              </div>
            </div>

            {/* Active Sorties / Mission Radar Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Active Corridor Sorties &amp; Transit Routes</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time status of dispatches across Noida, Delhi-NCR &amp; Gurugram Hubs</p>
                </div>
                <button
                  onClick={() => setShowNewSortieModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#3b0080] hover:bg-[#2e0066] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dispatch New Sortie</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Sortie ID</th>
                      <th className="py-3 px-4">Assigned UAV</th>
                      <th className="py-3 px-4">Origin &bull; Destination</th>
                      <th className="py-3 px-4">Package</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 8).map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#3b0080]">{o.id}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {o.drone_id || 'Auto-Allocated UAV'}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800 truncate max-w-[200px]">{o.drop_address}</p>
                          <p className="text-[10px] text-slate-400">From: {o.pickup_address}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{o.package_type || 'Standard Payload'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ['in-flight', 'approaching', 'taking-off'].includes(o.status) ? 'bg-sky-100 text-sky-800 animate-pulse' :
                            o.status === 'on-hold' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              onNavigate('track');
                              window.history.pushState({}, '', `/track?id=${o.id}`);
                            }}
                            className="text-[#3b0080] hover:underline font-bold text-[11px]"
                          >
                            Live Radar &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No active flight sorties logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: PERSONNEL MANAGEMENT DIRECTORY
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'personnel' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search personnel by name, email, or mobile..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Super Admin</option>
                  <option value="fleet_manager">Fleet Manager</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="support">Support Desk</option>
                </select>

                <button
                  onClick={() => {
                    resetProvisioningForm();
                    setActiveTab('provision');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#3b0080] hover:bg-[#2e0066] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Provision New User</span>
                </button>
              </div>
            </div>

            {/* Personnel Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">User ID &amp; Name</th>
                      <th className="py-3.5 px-4">Assigned Role</th>
                      <th className="py-3.5 px-4">Official Contact</th>
                      <th className="py-3.5 px-4">Base Station / Plant</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#3b0080] flex items-center justify-center font-bold text-xs uppercase">
                              {u.name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.role === 'admin' ? 'bg-purple-100 text-[#3b0080]' :
                            u.role === 'fleet_manager' ? 'bg-amber-100 text-amber-800' :
                            u.role === 'dispatcher' ? 'bg-sky-100 text-sky-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role === 'admin' ? '👑 Super Admin' :
                             u.role === 'fleet_manager' ? '🛠️ Fleet Manager' :
                             u.role === 'dispatcher' ? '📦 Dispatcher' :
                             '🎧 Support Desk'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-slate-800 font-medium">{u.email}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{u.phone || 'No phone registered'}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <p className="font-medium text-slate-800">{u.station || 'IndoWings Plant'}</p>
                          <p className="text-[11px] text-slate-400">{u.organization || 'IndoWings Corporate'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                            {u.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {u.role === 'admin' ? (
                            <span className="text-xs text-slate-400 italic">Protected</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Deactivate and remove user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No personnel records found matching current query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: DEDICATED USER PROVISIONING PAGE (WITH ADMIN OTP VERIFICATION)
            (NO POPUP! Full dedicated screen as requested)
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'provision' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Header with back link */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('personnel')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                &larr; Back to Personnel Directory
              </button>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Super Admin Security Protocol
              </span>
            </div>

            {/* Success Card when created */}
            {provisioningSuccess ? (
              <div className="bg-white border border-emerald-200 rounded-3xl p-8 text-center shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl border border-emerald-100">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Personnel ID Provisioned Successfully!</h2>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Account created for <strong>{provisioningSuccess.name}</strong> ({provisioningSuccess.role}) with ID <strong>{provisioningSuccess.id}</strong>.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2 font-mono">
                  <p><span className="text-slate-400 font-bold font-sans">Login Email:</span> {provisioningSuccess.email}</p>
                  <p><span className="text-slate-400 font-bold font-sans">Temporary Pass:</span> {provTempPass || 'Provisioned Passkey'}</p>
                  <p><span className="text-slate-400 font-bold font-sans">First-Time Action:</span> User will be prompted to change password via OTP upon first login.</p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      resetProvisioningForm();
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Provision Another User
                  </button>
                  <button
                    onClick={() => setActiveTab('personnel')}
                    className="px-5 py-2.5 rounded-xl bg-[#3b0080] hover:bg-[#2e0066] text-white font-bold text-xs cursor-pointer shadow-sm"
                  >
                    View in Personnel Directory
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Provision New Personnel ID
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Create authorized login credentials for IndoFleet operations. As a security measure, Admin OTP verification is mandatory before saving new credentials.
                  </p>
                </div>

                <form onSubmit={handleProvisionUser} className="space-y-6">
                  {/* Step 1: User Profile Details */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-[#3b0080] flex items-center justify-center text-[10px]">1</span>
                      Personnel Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={provName}
                          onChange={e => setProvName(e.target.value)}
                          placeholder="e.g. Ramesh Chandra"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#3b0080] bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Corporate Email Address *</label>
                        <input
                          type="email"
                          required
                          value={provEmail}
                          onChange={e => setProvEmail(e.target.value)}
                          placeholder="e.g. ramesh@indowings.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#3b0080] bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Phone (10 Digits)</label>
                        <input
                          type="tel"
                          value={provPhone}
                          onChange={e => setProvPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#3b0080] bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Operational Role *</label>
                        <select
                          value={provRole}
                          onChange={e => setProvRole(e.target.value as any)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#3b0080] bg-slate-50/50 font-bold text-slate-800"
                        >
                          <option value="dispatcher">📦 Dispatcher (Sorties &amp; Waypoints)</option>
                          <option value="fleet_manager">🛠️ Fleet QC Manager (Hardware &amp; Airworthiness)</option>
                          <option value="support">🎧 Support Desk Officer (Client Inquiries)</option>
                          <option value="admin">👑 Super Admin (Full Platform Control)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Base Station / Facility</label>
                        <input
                          type="text"
                          value={provStation}
                          onChange={e => setProvStation(e.target.value)}
                          placeholder="e.g. Noida Plant Sector 62"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#3b0080] bg-slate-50/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Temporary Initial Password</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={provTempPass}
                            onChange={e => setProvTempPass(e.target.value)}
                            placeholder="Enter initial temporary passkey (min 6 chars)"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#3b0080] bg-slate-50/50"
                          />
                          <button
                            type="button"
                            onClick={() => setProvTempPass('IW@' + Math.floor(1000 + Math.random() * 9000))}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer"
                          >
                            Generate
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          User will be required to change this upon first login via OTP.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Super Admin Security OTP Verification */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-[#3b0080] flex items-center justify-center text-[10px]">2</span>
                      Super Admin Security Authorization (OTP Verification)
                    </h3>

                    <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-[#3b0080] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Authorization Required by Super Admin ({currentUser?.name || 'Puneet Kushwaha'})
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            To ensure high-security enterprise compliance, confirm this creation by entering an OTP sent to your registered Admin address.
                          </p>
                        </div>
                      </div>

                      {/* Channel Picker */}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="adminChannel"
                            checked={adminOtpChannel === 'email'}
                            onChange={() => setAdminOtpChannel('email')}
                            className="text-[#3b0080]"
                          />
                          <Mail className="w-3.5 h-3.5 text-purple-600" />
                          <span>Admin Email ({currentUser?.email || 'puneet@indowings.com'})</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="adminChannel"
                            checked={adminOtpChannel === 'phone'}
                            onChange={() => setAdminOtpChannel('phone')}
                            className="text-[#3b0080]"
                          />
                          <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                          <span>Admin Phone ({currentUser?.phone || '+919999999999'})</span>
                        </label>
                      </div>

                      {/* Send OTP button or OTP input */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleRequestAdminOtp}
                          disabled={adminOtpLoading}
                          className="px-4 py-2.5 rounded-xl bg-white border border-purple-300 hover:bg-purple-50 text-[#3b0080] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{adminOtpSent ? 'Resend Security OTP' : 'Send Admin Security OTP'}</span>
                        </button>

                        {adminOtpSent && (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={adminOtp}
                              onChange={e => setAdminOtp(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="Enter 6-Digit OTP"
                              className="px-4 py-2.5 rounded-xl border border-purple-300 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-[#3b0080] bg-white font-bold"
                            />
                          </div>
                        )}
                      </div>

                      {adminOtpError && (
                        <p className="text-xs text-red-600 font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{adminOtpError}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submission Row */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveTab('personnel')}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={adminOtpLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#3b0080] hover:bg-[#280058] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {adminOtpLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Authorize &amp; Provision User Account</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 4: FLEET MANAGEMENT (SINGLE & BULK DRONES)
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search fleet by UAV ID, serial, model, or city..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={droneFilter}
                  onChange={e => setDroneFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Fleet ({drones.length})</option>
                  <option value="qc_passed">QC Certified ({qcPassedDrones})</option>
                  <option value="idle">Idle / Ready</option>
                  <option value="en-route">En-Route</option>
                  <option value="charging">Charging</option>
                </select>

                <button
                  onClick={() => setShowAddSingleDrone(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-600" />
                  <span>Add 1 Drone</span>
                </button>

                <button
                  onClick={() => setShowBulkDroneModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#3b0080] to-purple-600 hover:from-[#2e0066] hover:to-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Bulk Import Drones</span>
                </button>
              </div>
            </div>

            {/* Drones Grid / Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">UAV ID &amp; Serial</th>
                      <th className="py-3.5 px-4">Model &bull; Payload</th>
                      <th className="py-3.5 px-4">Station Location</th>
                      <th className="py-3.5 px-4">Flight Status</th>
                      <th className="py-3.5 px-4">Battery</th>
                      <th className="py-3.5 px-4">QC Airworthiness</th>
                      <th className="py-3.5 px-4 text-right">QC Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDrones.slice(0, 25).map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-mono font-bold text-slate-900">{d.id}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{d.serial_number}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800">{d.model}</p>
                          <p className="text-[11px] text-slate-500">{d.payload_kg || 5} kg payload capacity</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {d.current_city}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            d.status === 'idle' ? 'bg-emerald-100 text-emerald-800' :
                            d.status === 'en-route' ? 'bg-sky-100 text-sky-800 animate-pulse' :
                            d.status === 'charging' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${
                                  (d.battery || 100) > 50 ? 'bg-emerald-500' :
                                  (d.battery || 100) > 20 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${d.battery || 100}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-xs">{d.battery || 100}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            d.qc_status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {d.qc_status === 'passed' ? 'Passed' : 'QC Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleDroneQC(d.id, d.qc_status)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              d.qc_status === 'passed'
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {d.qc_status === 'passed' ? 'Revoke QC' : 'Certify Pass'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 5: DISPATCH & SORTIES CONTROL
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dispatch' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Direct Flight Dispatch Control</h3>
                <p className="text-xs text-slate-500 mt-0.5">Super Admin authority to clear, dispatch, or hold air corridor sorties.</p>
              </div>
              <button
                onClick={() => setShowNewSortieModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#3b0080] hover:bg-[#2e0066] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Flight Sortie</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Flight Sortie ID</th>
                      <th className="py-3 px-4">Consignee</th>
                      <th className="py-3 px-4">Assigned UAV</th>
                      <th className="py-3 px-4">Route Leg</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Radar Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#3b0080]">{o.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{o.customer_name || 'Enterprise Client'}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{o.drone_id || 'UAV-TBD'}</td>
                        <td className="py-3 px-4">
                          <p className="text-xs text-slate-800 font-medium truncate max-w-[240px]">{o.drop_address}</p>
                          <p className="text-[10px] text-slate-400">Hub: {o.pickup_address}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ['in-flight', 'approaching'].includes(o.status) ? 'bg-sky-100 text-sky-800 animate-pulse' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              onNavigate('track');
                              window.history.pushState({}, '', `/track?id=${o.id}`);
                            }}
                            className="text-[#3b0080] hover:underline font-bold text-xs"
                          >
                            Track Live &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 6: SUPPORT & GRIEVANCES DESK POWER
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Support Desk Master Oversight</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time inquiries and expert consultation requests submitted by clients via /support.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={supportFilter}
                  onChange={e => setSupportFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="all">All Inquiries ({expertRequests.length})</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In-Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Client Name &amp; Contact</th>
                      <th className="py-3 px-4">Category &bull; Priority</th>
                      <th className="py-3 px-4">Message / Query</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expertRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#3b0080]">{r.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{r.name}</p>
                          <p className="text-xs text-slate-500">{r.email || r.phone}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-700 capitalize">{r.category || 'General'}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            r.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {r.priority || 'Normal'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {r.message}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.status !== 'resolved' ? (
                            <button
                              onClick={() => handleUpdateSupportStatus(r.id, 'resolved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Resolve
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-600 font-bold">Resolved &check;</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {expertRequests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          No active support desk inquiries logged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── MODAL 1: ADD SINGLE DRONE ──────────────────────────────────── */}
      {showAddSingleDrone && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Single Drone to Fleet</h3>
              <button onClick={() => setShowAddSingleDrone(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSingleDrone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Drone Model</label>
                <select
                  value={newDroneModel}
                  onChange={e => setNewDroneModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                >
                  <option value="Cyberone Pro">Cyberone Pro</option>
                  <option value="Cyberone Max">Cyberone Max</option>
                  <option value="IndoHawk Alpha">IndoHawk Alpha</option>
                  <option value="StealthPro VTOL">StealthPro VTOL</option>
                  <option value="AgriWing X">AgriWing X</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Serial (Optional)</label>
                <input
                  type="text"
                  value={newDroneSerial}
                  onChange={e => setNewDroneSerial(e.target.value)}
                  placeholder="Auto-generated if left blank"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Station Hub</label>
                <input
                  type="text"
                  value={newDroneStation}
                  onChange={e => setNewDroneStation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Battery %</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={newDroneBattery}
                    onChange={e => setNewDroneBattery(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payload (kg)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newDronePayload}
                    onChange={e => setNewDronePayload(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSingleDrone(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3b0080] text-white text-xs font-bold cursor-pointer"
                >
                  Add Drone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: BULK IMPORT DRONES ───────────────────────────────── */}
      {showBulkDroneModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bulk Batch Drone Provisioning</h3>
                <p className="text-xs text-slate-500">Generate multiple enterprise UAVs with 1 click</p>
              </div>
              <button onClick={() => setShowBulkDroneModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBulkAddDrones} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch Quantity to Provision</label>
                <div className="flex gap-2">
                  {[5, 10, 20, 50].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setBulkCount(qty)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        bulkCount === qty ? 'bg-[#3b0080] text-white border-[#3b0080]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      +{qty} Drones
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fleet UAV Model</label>
                <select
                  value={bulkModel}
                  onChange={e => setBulkModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                >
                  <option value="Cyberone Pro">Cyberone Pro (Standard Long-Range)</option>
                  <option value="Cyberone Max">Cyberone Max (Heavy Cargo Payload)</option>
                  <option value="IndoHawk Alpha">IndoHawk Alpha (High-Speed Corridor Escort)</option>
                  <option value="StealthPro VTOL">StealthPro VTOL (Long Endurance)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Serial Number Prefix</label>
                <input
                  type="text"
                  value={bulkPrefix}
                  onChange={e => setBulkPrefix(e.target.value)}
                  placeholder="e.g. IW-DELHI-BATCH"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Station / Depot</label>
                <input
                  type="text"
                  value={bulkStation}
                  onChange={e => setBulkStation(e.target.value)}
                  placeholder="e.g. Connaught Place Hub"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-900">
                <p className="font-bold">Automated Batch Action:</p>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Generates {bulkCount} unique UAV units with DGCA NPNT clearance, pre-flight QC calibration, and assigns to {bulkStation}.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkDroneModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#3b0080] hover:bg-[#280058] text-white text-xs font-bold cursor-pointer flex items-center gap-2"
                >
                  {bulkSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Provision {bulkCount} Drones Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DISPATCH NEW SORTIE ──────────────────────────────── */}
      {showNewSortieModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Dispatch New Flight Sortie</h3>
              <button onClick={() => setShowNewSortieModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSortie} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client / Receiving Station</label>
                <input
                  type="text"
                  required
                  value={sortieCustomer}
                  onChange={e => setSortieCustomer(e.target.value)}
                  placeholder="e.g. AIIMS Trauma Center Drone Station"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Hub</label>
                <input
                  type="text"
                  value={sortiePickup}
                  onChange={e => setSortiePickup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Address / Helipad *</label>
                <input
                  type="text"
                  required
                  value={sortieDrop}
                  onChange={e => setSortieDrop(e.target.value)}
                  placeholder="e.g. Sector 128 Health Logistics Depot"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payload Type</label>
                <input
                  type="text"
                  value={sortiePackage}
                  onChange={e => setSortiePackage(e.target.value)}
                  placeholder="e.g. Critical Medical &amp; Avionics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewSortieModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3b0080] hover:bg-[#280058] text-white text-xs font-bold cursor-pointer"
                >
                  Dispatch Sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
