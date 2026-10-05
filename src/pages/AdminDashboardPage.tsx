import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Package,
  Layers,
  ArrowRight,
  Headphones,
  X,
  UserPlus,
  Loader2,
  Trash2,
  Check,
  Lock,
  ChevronRight,
  Building2,
  Phone,
  Mail
} from 'lucide-react';
import { DeliveryUser } from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';

interface AdminDashboardProps {
  currentUser: DeliveryUser | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({
  currentUser,
  onNavigate,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'personnel' | 'provision' | 'fleet' | 'dispatch' | 'support'>('overview');
  
  // Data States
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

  // Simple Team Member Provisioning State (NO Base Camp)
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provRole, setProvRole] = useState<'admin' | 'fleet_manager' | 'dispatcher' | 'support'>('dispatcher');
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
  const [newDroneCity, setNewDroneCity] = useState('Noida Sector 62 Plant');
  const [newDroneBattery, setNewDroneBattery] = useState(100);
  const [newDronePayload, setNewDronePayload] = useState(5);
  
  // Bulk Drone Import State (50, 100, 250, 500, 1000)
  const [bulkCount, setBulkCount] = useState(100);
  const [bulkModel, setBulkModel] = useState('Cyberone Pro');
  const [bulkPrefix, setBulkPrefix] = useState('IW-UAV-BATCH');
  const [bulkCity, setBulkCity] = useState('Noida Sector 62 Plant');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Drone Shipment Dispatch State (Shipping manufactured drones to clients)
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchClient, setDispatchClient] = useState('');
  const [dispatchContact, setDispatchContact] = useState('');
  const [dispatchPhone, setDispatchPhone] = useState('');
  const [dispatchAddress, setDispatchAddress] = useState('');
  const [dispatchModel, setDispatchModel] = useState('Cyberone Pro');
  const [dispatchUnits, setDispatchUnits] = useState(5);
  const [dispatchCarrier, setDispatchCarrier] = useState('IndoWings Secured Fleet Van');
  const [dispatchNotes, setDispatchNotes] = useState('Pre-dispatch hardware QC verified');

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
      setAdminOtpError('Please enter an initial temporary password (min 6 characters) or click Generate.');
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
          temporaryPassword: provTempPass.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminOtpError(data.error || 'Authorization failed. Please check OTP code.');
        return;
      }

      setProvisioningSuccess(data.user);
      showToast(`Account created for ${data.user?.name}! Credentials and onboarding steps emailed.`);
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
    if (!confirm(`Are you sure you want to revoke access for ${name}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Revoked access for ${name}`);
        setUsers(users.filter(u => u.id !== id));
      }
    } catch {
      showToast('Error removing user account.');
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
          current_city: newDroneCity,
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

  // Bulk Add Drones (50, 100, 250, 500, 1000)
  const handleBulkAddDrones = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkCount < 1) {
      alert('Please specify at least 1 drone.');
      return;
    }
    setBulkSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/drones/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: bulkCount,
          model: bulkModel,
          prefix: bulkPrefix,
          current_city: bulkCity
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowBulkDroneModal(false);
        showToast(`Successfully provisioned batch of ${data.count} drones!`);
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

  // Dispatch Drones to Client
  const handleDispatchDrones = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchClient.trim() || !dispatchAddress.trim()) {
      alert('Client Name and Destination Delivery Address are required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: dispatchClient.trim(),
          recipient_name: dispatchContact.trim() || dispatchClient.trim(),
          customer_phone: dispatchPhone.trim(),
          destination_address: dispatchAddress.trim(),
          drone_model: dispatchModel,
          units_count: Number(dispatchUnits) || 1,
          carrier: dispatchCarrier,
          delivery_notes: dispatchNotes.trim()
        })
      });
      if (res.ok) {
        setShowDispatchModal(false);
        setDispatchClient('');
        setDispatchContact('');
        setDispatchPhone('');
        setDispatchAddress('');
        showToast(`Dispatched ${dispatchUnits}x ${dispatchModel} to ${dispatchClient}!`);
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
    if (droneFilter === 'all') return true;
    if (droneFilter === 'qc_passed') return d.qc_status === 'passed';
    if (droneFilter === 'qc_pending') return d.qc_status !== 'passed';
    return d.status === droneFilter;
  });

  const filteredSupport = expertRequests.filter(s => {
    if (supportFilter === 'all') return true;
    return s.status === supportFilter;
  });

  const activeShipmentsCount = orders.filter(o => o.status !== 'delivered').length;
  const completedHandoversCount = orders.filter(o => o.status === 'delivered').length;
  const qcCertifiedCount = drones.filter(d => d.qc_status === 'passed').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pt-24 sm:pt-28 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3b0080] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTAINER WITH STICKY SIDEBAR ────────────────── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ═════════════════════════════════════════════════════════════════
              LEFT SIDEBAR: MODERN, CLEAN, NON-SCROLLABLE
          ═════════════════════════════════════════════════════════════════ */}
          <aside className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-28 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-5">
              
              {/* Sidebar Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#3b0080] flex items-center justify-center font-black shadow-xs shrink-0">
                  <Shield className="w-5 h-5 text-[#3b0080]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight truncate">Super Admin Desk</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">IndoWings Operations</p>
                </div>
              </div>

              {/* Navigation Menu Links */}
              <nav className="space-y-1.5 text-xs font-bold">
                {[
                  { id: 'overview', label: 'Overview & Shipments', icon: Layers, badge: null },
                  { id: 'personnel', label: 'Personnel Directory', icon: Users, badge: users.length },
                  { id: 'provision', label: 'Add Team Member', icon: UserPlus, badge: 'New', isNew: true },
                  { id: 'fleet', label: 'Fleet & Inventory', icon: Truck, badge: drones.length },
                  { id: 'dispatch', label: 'Drone Dispatches', icon: Package, badge: orders.length },
                  { id: 'support', label: 'Support Desk Power', icon: Headphones, badge: expertRequests.length },
                ].map(({ id, label, icon: Icon, badge, isNew }) => (
                  <button
                    key={id}
                    onClick={() => {
                      if (id === 'provision') resetProvisioningForm();
                      setActiveTab(id as any);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all text-left cursor-pointer group ${
                      activeTab === id
                        ? 'bg-[#3b0080] text-white shadow-md shadow-purple-900/10 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        activeTab === id ? 'text-white' : 'text-slate-400 group-hover:text-[#3b0080]'
                      }`} />
                      <span className="truncate">{label}</span>
                    </div>
                    {badge !== null && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                        activeTab === id
                          ? 'bg-white/20 text-white'
                          : isNew ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Quick Action Shortcuts inside Sidebar */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Quick Actions</p>
                <button
                  onClick={() => setShowDispatchModal(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3b0080] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    Dispatch Drones
                  </span>
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setShowBulkDroneModal(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-purple-700" />
                    Bulk UAV Batch
                  </span>
                  <span className="text-[10px] font-black text-purple-700">+1000</span>
                </button>
              </div>

              {/* Current User Card at bottom of Sidebar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b0080] to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {currentUser?.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Puneet Kushwaha'}</p>
                    <p className="text-[10px] text-purple-700 font-semibold truncate">Super Admin</p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* ═════════════════════════════════════════════════════════════════
              RIGHT CONTENT WORKSPACE
          ═════════════════════════════════════════════════════════════════ */}
          <main className="flex-1 min-w-0 w-full space-y-6">

            {/* TOP METRICS SUMMARY STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Personnel</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{users.length}</p>
                <span className="text-[10px] text-purple-700 font-bold">Active Roles</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">UAV Inventory</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{drones.length}</p>
                <span className="text-[10px] text-emerald-600 font-bold">{qcCertifiedCount} QC Passed</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Client Dispatches</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{orders.length}</p>
                <span className="text-[10px] text-sky-600 font-bold">{activeShipmentsCount} In Transit</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Client Handovers</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{completedHandoversCount}</p>
                <span className="text-[10px] text-emerald-600 font-bold">Signed Challans</span>
              </div>
            </div>

            {/* ── TAB 1: OVERVIEW & OUTBOUND DRONE SHIPMENTS ────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">UAV Units in Plant</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">{drones.length}</span>
                      <span className="text-xs font-bold text-purple-700">Manufactured Units</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">DGCA Type-Certified models in inventory</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Outbound Shipments</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">{orders.length}</span>
                      <span className="text-xs font-bold text-sky-600">{activeShipmentsCount} In Transit</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">Factory to client delivery consignments</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">QC Airworthiness Passed</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-600">{qcCertifiedCount}</span>
                      <span className="text-xs font-bold text-emerald-700">Cleared for Dispatch</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">100% Multi-point hardware verified</p>
                  </div>
                </div>

                {/* Outbound Drone Shipments Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Live Outbound Drone Shipments to Clients</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Tracking manufactured UAV units dispatched to enterprise, defense &amp; agriculture clients</p>
                    </div>
                    <button
                      onClick={() => setShowDispatchModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#3b0080] hover:bg-[#2e0066] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Dispatch Drones to Client</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Consignment ID</th>
                          <th className="py-3 px-4">Client / Enterprise</th>
                          <th className="py-3 px-4">Drones Shipped</th>
                          <th className="py-3 px-4">Destination Facility</th>
                          <th className="py-3 px-4">Carrier Mode</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 10).map(o => (
                          <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-[#3b0080]">{o.id}</span>
                              {o.challan_number && (
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{o.challan_number}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {o.client_name || o.customer_name || 'Enterprise Client'}
                            </td>
                            <td className="py-3 px-4 font-semibold text-purple-900">
                              {o.drones_shipped || o.package_type || 'UAV Hardware Consignment'}
                            </td>
                            <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">
                              {o.destination_address || o.drop_address || 'Client Facility'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-medium">
                              {o.carrier || 'IndoWings Fleet Van'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                ['in-flight', 'in_transit', 'assigned'].includes(o.status) ? 'bg-sky-100 text-sky-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {o.status === 'delivered' ? 'Delivered & Accepted' : 'In Transit'}
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
                                Track Shipment &rarr;
                              </button>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              No drone shipments dispatched yet. Click "Dispatch Drones to Client" to ship UAVs.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: PERSONNEL MANAGEMENT DIRECTORY ────────────────────── */}
            {activeTab === 'personnel' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search personnel by name, email, or mobile..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#3b0080]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={roleFilter}
                      onChange={e => setRoleFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Super Admin</option>
                      <option value="fleet_manager">Fleet Manager</option>
                      <option value="dispatcher">Dispatcher</option>
                      <option value="support">Support Specialist</option>
                    </select>

                    <button
                      onClick={() => {
                        resetProvisioningForm();
                        setActiveTab('provision');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#3b0080] hover:bg-[#2e0066] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add New Member</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">User ID &amp; Name</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Contact (Email &amp; Mobile)</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#3b0080] font-black flex items-center justify-center shrink-0">
                                  {u.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{u.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{u.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                u.role === 'admin' ? 'bg-purple-100 text-[#3b0080]' :
                                u.role === 'fleet_manager' ? 'bg-amber-100 text-amber-800' :
                                u.role === 'dispatcher' ? 'bg-sky-100 text-sky-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {u.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-800">{u.email}</p>
                              <p className="text-[11px] text-slate-400">{u.phone || 'No mobile'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {u.status || 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {u.email === currentUser?.email || u.id === 'ADMIN-001' ? (
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Protected</span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Revoke access"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: PROVISION TEAM MEMBER (SIMPLE LANGUAGE) ───────────── */}
            {activeTab === 'provision' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Add New Team Member
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter details below. Verify with your Admin OTP to activate the account and email them credentials with next steps.
                  </p>
                </div>

                {/* Success Card when created */}
                {provisioningSuccess ? (
                  <div className="bg-white border border-emerald-200 rounded-3xl p-8 text-center shadow-sm space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl border border-emerald-100">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Account Created &amp; Credentials Emailed!</h3>
                    <p className="text-slate-600 text-sm max-w-md mx-auto">
                      Account provisioned for <strong>{provisioningSuccess.name}</strong> ({provisioningSuccess.role}). An email with their User ID, temporary passkey, login link, and onboarding steps has been dispatched to:
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2 font-mono">
                      <p><span className="text-slate-400 font-bold font-sans">User ID:</span> {provisioningSuccess.id}</p>
                      <p><span className="text-slate-400 font-bold font-sans">Login Email:</span> {provisioningSuccess.email}</p>
                      <p><span className="text-slate-400 font-bold font-sans">Temporary Pass:</span> {provTempPass || '••••••••'}</p>
                      <p><span className="text-slate-400 font-bold font-sans">First-Time Action:</span> User will be prompted to verify identity via OTP and set a permanent password.</p>
                    </div>
                    <div className="pt-2 flex justify-center gap-3">
                      <button
                        onClick={resetProvisioningForm}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Add Another Member
                      </button>
                      <button
                        onClick={() => setActiveTab('personnel')}
                        className="px-5 py-2.5 rounded-xl bg-[#3b0080] hover:bg-[#2e0066] text-white font-bold text-xs cursor-pointer shadow-sm"
                      >
                        View Directory
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <form onSubmit={handleProvisionUser} className="space-y-5">
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-[#3b0080] flex items-center justify-center text-xs">1</span>
                          Member Details
                        </h3>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={provName}
                            onChange={e => setProvName(e.target.value)}
                            placeholder="e.g. Ramesh Chandra"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#3b0080]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Corporate Email Address *</label>
                            <input
                              type="email"
                              required
                              value={provEmail}
                              onChange={e => setProvEmail(e.target.value)}
                              placeholder="e.g. ramesh@indowings.com"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#3b0080]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Phone (10 Digits)</label>
                            <input
                              type="tel"
                              maxLength={10}
                              value={provPhone}
                              onChange={e => setProvPhone(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="e.g. 9876543210"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#3b0080]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Operational Role *</label>
                          <select
                            value={provRole}
                            onChange={e => setProvRole(e.target.value as any)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:border-[#3b0080]"
                          >
                            <option value="dispatcher">🚚 Dispatcher (Outbound Drone Shipments &amp; Consignments)</option>
                            <option value="fleet_manager">🛠️ Fleet &amp; QC Manager (Drone Inventory &amp; Hardware Certification)</option>
                            <option value="support">🎧 Support Desk Officer (Customer Inquiries &amp; Assistance)</option>
                            <option value="admin">👑 Super Admin (Full Control Over Entire System)</option>
                          </select>
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
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer"
                            >
                              Generate Passkey
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            User will be required to verify identity and set their permanent password upon first login.
                          </p>
                        </div>
                      </div>

                      {/* Step 2: Admin OTP Verification */}
                      <div className="border-t border-slate-100 pt-5 space-y-4">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-[#3b0080] flex items-center justify-center text-xs">2</span>
                          Admin Authorization (OTP Verification)
                        </h3>

                        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 space-y-3">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            To authorize creating this account, enter the OTP sent to your registered Admin channel:
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => { setAdminOtpChannel('email'); setAdminOtpSent(false); }}
                              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                                adminOtpChannel === 'email' ? 'border-[#3b0080] bg-white text-[#3b0080] shadow-xs' : 'border-purple-200 text-slate-600 bg-transparent'
                              }`}
                            >
                              <p>Admin Email</p>
                              <p className="text-[10px] text-slate-400 font-normal truncate">{currentUser?.email || 'puneet@indowings.com'}</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => { setAdminOtpChannel('phone'); setAdminOtpSent(false); }}
                              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                                adminOtpChannel === 'phone' ? 'border-[#3b0080] bg-white text-[#3b0080] shadow-xs' : 'border-purple-200 text-slate-600 bg-transparent'
                              }`}
                            >
                              <p>Admin Phone</p>
                              <p className="text-[10px] text-slate-400 font-normal truncate">{currentUser?.phone || '+919999999999'}</p>
                            </button>
                          </div>

                          {!adminOtpSent ? (
                            <button
                              type="button"
                              onClick={handleRequestAdminOtp}
                              disabled={adminOtpLoading}
                              className="w-full py-2.5 rounded-xl bg-[#3b0080] hover:bg-[#2c0060] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {adminOtpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>Send Admin Security OTP</span>
                            </button>
                          ) : (
                            <div className="space-y-2 pt-1">
                              <label className="block text-[11px] font-bold uppercase text-slate-500">
                                Enter 6-Digit Admin OTP
                              </label>
                              <input
                                type="text"
                                maxLength={6}
                                value={adminOtp}
                                onChange={e => setAdminOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Enter 6-Digit OTP"
                                className="w-full px-4 py-2.5 rounded-xl border border-purple-300 text-sm font-mono tracking-widest text-center focus:outline-none focus:border-[#3b0080] bg-white font-bold"
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

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={resetProvisioningForm}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Reset Form
                          </button>

                          <button
                            type="submit"
                            disabled={adminOtpLoading || !adminOtp.trim() || !provName.trim() || !provEmail.trim() || !provTempPass.trim()}
                            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {adminOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>Authorize &amp; Create Member</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: FLEET & INVENTORY (500 TO 1000+ BULK PROVISIONING) ─ */}
            {activeTab === 'fleet' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <select
                      value={droneFilter}
                      onChange={e => setDroneFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                      <option value="all">All Fleet UAVs</option>
                      <option value="qc_passed">QC Certified Only</option>
                      <option value="qc_pending">Inspection Required</option>
                      <option value="idle">Ready in Factory</option>
                      <option value="en-route">In Transit / Dispatched</option>
                    </select>
                    <span className="text-xs text-slate-400 font-semibold">{filteredDrones.length} UAV units listed</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddSingleDrone(true)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+1 Single Drone</span>
                    </button>

                    <button
                      onClick={() => setShowBulkDroneModal(true)}
                      className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>⚡ Bulk Batch Add (50 to 1000+)</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Drone ID &amp; Serial</th>
                          <th className="py-3 px-4">Model</th>
                          <th className="py-3 px-4">Battery</th>
                          <th className="py-3 px-4">QC Airworthiness</th>
                          <th className="py-3 px-4">Plant Base</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">QC Toggle Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDrones.slice(0, 15).map(d => (
                          <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-mono font-bold text-slate-900">{d.id}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{d.serial_number}</p>
                            </td>
                            <td className="py-3 px-4 font-bold text-[#3b0080]">{d.model}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800">{d.battery}%</span>
                                <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-1.5 rounded-full ${d.battery > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${d.battery}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                d.qc_status === 'passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {d.qc_status === 'passed' ? '✓ Passed' : 'Inspection Required'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{d.current_city || 'Noida Plant'}</td>
                            <td className="py-3 px-4">
                              <span className="capitalize font-semibold text-slate-700">{d.status}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleToggleDroneQC(d.id, d.qc_status)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border border-slate-200 hover:bg-purple-50 hover:text-[#3b0080] transition-colors cursor-pointer"
                              >
                                Toggle QC Status
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

            {/* ── TAB 5: CLIENT DRONE DISPATCHES & SHIPMENTS ───────────────── */}
            {activeTab === 'dispatch' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Drone Shipments &amp; Client Consignments</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ship manufactured UAV batches to enterprise and defense clients with verified technical handover challans.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDispatchModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#3b0080] hover:bg-[#2c0060] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Dispatch Drones to Client</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Consignment &amp; Challan</th>
                          <th className="py-3 px-4">Client / Enterprise</th>
                          <th className="py-3 px-4">Drones Dispatched</th>
                          <th className="py-3 px-4">Destination Facility</th>
                          <th className="py-3 px-4">Carrier Mode</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-mono font-bold text-[#3b0080]">{o.id}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{o.challan_number || 'CHL-2026-9021'}</p>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {o.client_name || o.customer_name || 'Enterprise Client'}
                              {o.recipient_phone && (
                                <p className="text-[10px] text-slate-400 font-normal">{o.recipient_phone}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-purple-900">
                              {o.drones_shipped || o.package_type || 'UAV Units'}
                            </td>
                            <td className="py-3 px-4 text-slate-600 truncate max-w-[200px]">
                              {o.destination_address || o.drop_address}
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-medium">
                              {o.carrier || 'IndoWings Fleet Van'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-sky-100 text-sky-800'
                              }`}>
                                {o.status === 'delivered' ? 'Delivered & Accepted' : 'In Transit'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  onNavigate('track');
                                  window.history.pushState({}, '', `/track?id=${o.id}`);
                                }}
                                className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-[#3b0080] hover:bg-purple-50 font-bold text-[11px] cursor-pointer"
                              >
                                Track &rarr;
                              </button>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              No drone shipments created yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 6: SUPPORT DESK POWER ────────────────────────────────── */}
            {activeTab === 'support' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <select
                      value={supportFilter}
                      onChange={e => setSupportFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                      <option value="all">All Inquiries ({expertRequests.length})</option>
                      <option value="pending">Pending Tickets</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Ticket ID &amp; Client</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Inquiry Details</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Resolution Power</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSupport.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{t.name || 'Anonymous Client'}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{t.id} &bull; {t.phone || t.email}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-[#3b0080]">
                                {t.category || 'General Support'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                              {t.message || t.notes || 'Inquiry regarding drone fleet'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {t.status || 'pending'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {t.status !== 'resolved' ? (
                                <button
                                  onClick={() => handleUpdateSupportStatus(t.id, 'resolved')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase cursor-pointer"
                                >
                                  ✓ 1-Click Resolve
                                </button>
                              ) : (
                                <span className="text-emerald-600 font-bold text-[11px]">Resolved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredSupport.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              No inquiries found.
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
        </div>
      </div>

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
                <label className="block text-xs font-bold text-slate-700 mb-1">Plant Location</label>
                <input
                  type="text"
                  value={newDroneCity}
                  onChange={e => setNewDroneCity(e.target.value)}
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

      {/* ── MODAL 2: BULK BATCH GENERATOR (50 TO 1000+) ──────────────────── */}
      {showBulkDroneModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bulk UAV Batch Provisioning</h3>
                <p className="text-xs text-slate-500">Generate 50 to 1000+ manufactured units into inventory</p>
              </div>
              <button onClick={() => setShowBulkDroneModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBulkAddDrones} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Batch Quantity Presets</label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[50, 100, 250, 500, 1000].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setBulkCount(qty)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        bulkCount === qty ? 'bg-[#3b0080] text-white border-[#3b0080]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Custom Quantity Input (Max 5,000)</label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={bulkCount}
                    onChange={e => setBulkCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Manufactured UAV Model</label>
                <select
                  value={bulkModel}
                  onChange={e => setBulkModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                >
                  <option value="Cyberone Pro">Cyberone Pro (Standard Long-Range)</option>
                  <option value="Cyberone Max">Cyberone Max (Heavy Cargo &amp; Defense)</option>
                  <option value="IndoHawk Alpha">IndoHawk Alpha (High-Speed Patrol)</option>
                  <option value="StealthPro VTOL">StealthPro VTOL (Long Endurance Hybrid)</option>
                  <option value="AgriWing X">AgriWing X (Agricultural Payload)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Serial Number Prefix</label>
                <input
                  type="text"
                  value={bulkPrefix}
                  onChange={e => setBulkPrefix(e.target.value)}
                  placeholder="e.g. IW-UAV-BATCH"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold"
                />
              </div>

              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-xs text-purple-900">
                <p className="font-bold">Automated Batch Action:</p>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Generates {bulkCount} unique manufactured UAV units with DGCA certification, pre-dispatch QC clearance, and adds to plant inventory.
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
                  className="px-5 py-2 rounded-xl bg-[#3b0080] hover:bg-[#280058] text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  {bulkSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Provision {bulkCount} Drones</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DISPATCH DRONES TO CLIENT ─────────────────────────── */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Dispatch Drone Consignment to Client</h3>
                <p className="text-xs text-slate-500">Ship manufactured UAV units with technical handover challan</p>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchDrones} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client / Receiving Organization *</label>
                <input
                  type="text"
                  required
                  value={dispatchClient}
                  onChange={e => setDispatchClient(e.target.value)}
                  placeholder="e.g. Indian Army Aviation Wing / Adani Agri Corp"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Receiving Officer / Consignee</label>
                  <input
                    type="text"
                    value={dispatchContact}
                    onChange={e => setDispatchContact(e.target.value)}
                    placeholder="e.g. Col. Rajesh Rathore"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={dispatchPhone}
                    onChange={e => setDispatchPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Destination / Delivery Facility *</label>
                <input
                  type="text"
                  required
                  value={dispatchAddress}
                  onChange={e => setDispatchAddress(e.target.value)}
                  placeholder="e.g. Leh Defense Base Depot, Ladakh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Drone Model</label>
                  <select
                    value={dispatchModel}
                    onChange={e => setDispatchModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                  >
                    <option value="Cyberone Pro">Cyberone Pro</option>
                    <option value="Cyberone Max">Cyberone Max</option>
                    <option value="StealthPro VTOL">StealthPro VTOL</option>
                    <option value="AgriWing X">AgriWing X</option>
                    <option value="IndoHawk Alpha">IndoHawk Alpha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity of Units</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={dispatchUnits}
                    onChange={e => setDispatchUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Logistics Transport Carrier</label>
                <select
                  value={dispatchCarrier}
                  onChange={e => setDispatchCarrier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                >
                  <option value="IndoWings Secured Fleet Van">IndoWings Secured Fleet Van (Regional)</option>
                  <option value="Dedicated Heavy Freight Cargo Truck">Dedicated Heavy Freight Cargo Truck (Inter-state)</option>
                  <option value="Express Air Cargo Logistics">Express Air Cargo Logistics (National)</option>
                  <option value="Defense Escorted Convoy">Defense Escorted Convoy (Special Clearance)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3b0080] hover:bg-[#280058] text-white text-xs font-bold cursor-pointer"
                >
                  Confirm &amp; Dispatch Drones
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
