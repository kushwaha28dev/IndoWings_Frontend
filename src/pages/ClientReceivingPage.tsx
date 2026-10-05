import React, { useState, useEffect } from 'react';
import { 
  Building2, PackageCheck, Truck, ShieldCheck, CheckCircle2, 
  Clock, Navigation, RefreshCw, FileText, Check, Award, Eye, 
  MapPin, Loader2, ArrowRight, Download, Star
} from 'lucide-react';
import { DeliveryUser } from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';

interface ClientReceivingPageProps {
  currentUser: DeliveryUser | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const ClientReceivingPage: React.FC<ClientReceivingPageProps> = ({ currentUser, onNavigate, onLogout }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'incoming' | 'delivered'>('incoming');

  // Handover Acceptance Modal
  const [selectedOrderForHandover, setSelectedOrderForHandover] = useState<any | null>(null);
  const [inspectorName, setInspectorName] = useState(currentUser?.name || '');
  const [conditionRating, setConditionRating] = useState(5);
  const [remarks, setRemarks] = useState('All avionics, airframe components, and payload sensors verified intact upon physical unboxing.');
  const [submittingHandover, setSubmittingHandover] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/api/delivery/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const incomingShipments = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const deliveredShipments = orders.filter(o => o.status === 'delivered');

  const openHandoverModal = (order: any) => {
    setSelectedOrderForHandover(order);
    setInspectorName(currentUser?.name || 'Col. Amit Verma');
    setConditionRating(5);
    setRemarks('All avionics, airframe components, and payload sensors verified intact upon physical unboxing.');
    setHandoverSuccess(false);
  };

  const handleConfirmHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForHandover) return;
    setSubmittingHandover(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/orders/${selectedOrderForHandover.id}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspector_name: inspectorName,
          condition_rating: conditionRating,
          remarks
        })
      });

      if (res.ok) {
        setHandoverSuccess(true);
        setTimeout(() => {
          setSelectedOrderForHandover(null);
          setHandoverSuccess(false);
          fetchOrders();
        }, 1500);
      }
    } catch (err) {
      console.error('Handover error:', err);
    } finally {
      setSubmittingHandover(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-900 shadow-md">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">Client Receiving Portal</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Authorized Receiving Officer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentUser?.organization || 'Defense & Aerospace Logistics'} · {currentUser?.station || 'Northern Airbase Depot'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-300 font-semibold">{currentUser?.name || 'Col. Amit Verma'}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Incoming Drone Shipments</span>
              <Truck className="w-5 h-5 text-sky-600" />
            </div>
            <p className="text-3xl font-black text-slate-900">{incomingShipments.length}</p>
            <p className="text-xs text-sky-600 font-medium mt-1">In-Transit or Awaiting Handover</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Accepted & Delivered Units</span>
              <PackageCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-600">{deliveredShipments.length}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Inspected & Commissioned Into Base</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Station Airworthiness</span>
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-purple-600">100%</p>
            <p className="text-xs text-slate-500 mt-1">DGCA Certified & Warranty Active</p>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'incoming' ? 'bg-[#3b0080] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🚚 Incoming Drone Shipments ({incomingShipments.length})
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'delivered' ? 'bg-[#3b0080] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📦 Received & Accepted Fleet ({deliveredShipments.length})
          </button>
        </div>

        {activeTab === 'incoming' && (
          <div className="space-y-4">
            {incomingShipments.map(o => (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-purple-50 text-[#3b0080] border border-purple-200">
                      {o.id}
                    </span>
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      {o.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {o.drone_model || 'IndoWings Cyberone Heavy Delivery UAV'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>Origin: <strong>Noida Sector 62 Plant</strong></span>
                    <span>➔</span>
                    <span>Destination: <strong>{o.destination_address || o.delivery_address || 'Client Airbase'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => openHandoverModal(o)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept & Inspect Drone Delivery</span>
                  </button>
                </div>
              </div>
            ))}

            {incomingShipments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No Pending Drone Deliveries</h4>
                <p className="text-xs text-slate-400 mt-1">All scheduled drone shipments have been inspected and accepted.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'delivered' && (
          <div className="space-y-4">
            {deliveredShipments.map(o => (
              <div
                key={o.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {o.id}
                    </span>
                    <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Handover Complete
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {o.drone_model || 'IndoWings Cyberone UAV Unit'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Delivered on: {o.delivered_at ? new Date(o.delivered_at).toLocaleDateString() : 'Today'} · Inspected by: <strong>{o.handover_details?.inspector_name || 'Receiving Officer'}</strong>
                  </p>
                  {o.handover_details?.remarks && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                      <strong>Inspection Notes:</strong> {o.handover_details.remarks}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Warranty Active (1 Yr)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Handover & Inspection Acceptance Modal */}
      {selectedOrderForHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Physical Handover & Technical Acceptance</h3>
                <p className="text-xs text-slate-500">Shipment ID: {selectedOrderForHandover.id}</p>
              </div>
              <button onClick={() => setSelectedOrderForHandover(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {handoverSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Drone Successfully Accepted!</h4>
                <p className="text-xs text-slate-500">
                  Digital handover signed and recorded into the IndoWings Enterprise Registry.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmHandover} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Receiving Officer / Inspector Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={e => setInspectorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Hardware Condition Rating (Upon Delivery)
                  </label>
                  <div className="flex gap-2">
                    {[5, 4, 3, 2, 1].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setConditionRating(r)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          conditionRating === r
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {r} ★ {r === 5 ? '(Mint)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Physical Inspection Remarks & Serial Verification
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 font-medium">
                  🔒 By clicking accept, you certify that the physical drone unit matches the airworthiness manifest and DGCA serial tags.
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForHandover(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingHandover}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
                  >
                    {submittingHandover ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{submittingHandover ? 'Processing Handover...' : 'Confirm & Sign Handover'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
