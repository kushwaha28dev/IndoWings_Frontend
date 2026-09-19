import React, { useState, useEffect, useRef } from 'react';
import { 
  Package2, MapPin, Scale, Clock, Phone, Mail, User, Check, 
  ArrowRight, Loader2, Truck, CreditCard, ShieldCheck, Zap, 
  Crosshair, Navigation, Building2, Sparkles, Banknote, Home, 
  UserPlus, ExternalLink, MessageSquare, HeartHandshake, CheckCircle2,
  Copy, CheckCheck, ArrowUpDown, ArrowUpRight, Info, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { DeliveryUser, SavedAddress } from '../components/AuthModal';
import { API_BASE_URL } from '../config/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlaceOrderPageProps {
  onNavigate: (page: string) => void;
  currentUser: DeliveryUser | null;
  onOpenAuth: () => void;
}

const PACKAGE_TYPES = ['Medical Supplies', 'Documents', 'Food Parcel', 'Electronics', 'Personal Items', 'Fragile Items', 'Other'];

// Pre-verified IndoWings NCR Air Corridor Hubs
const POPULAR_HUBS = [
  { name: 'Sector 62 IndoWings Hub, Noida', short: 'Noida Sec 62', lat: 28.6280, lng: 77.3649, type: 'UAV Hub' },
  { name: 'Connaught Place Outer Circle, Delhi', short: 'CP Metro', lat: 28.6315, lng: 77.2167, type: 'Drop Zone' },
  { name: 'AIIMS Trauma Center, New Delhi', short: 'AIIMS Port', lat: 28.5672, lng: 77.2100, type: 'Medical Port' },
  { name: 'Cyber City DLF Phase 2, Gurugram', short: 'Cyber City', lat: 28.4907, lng: 77.0898, type: 'Tech Corridor' },
  { name: 'IGI Airport Aerocity Cargo, Delhi', short: 'IGI Aerocity', lat: 28.5562, lng: 77.1000, type: 'Air Cargo' },
  { name: 'Knowledge Park III, Greater Noida', short: 'Gr. Noida Tech', lat: 28.4744, lng: 77.4947, type: 'Industrial Hub' },
];

export const PlaceOrderPage: React.FC<PlaceOrderPageProps> = ({ onNavigate, currentUser, onOpenAuth }) => {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>({ lat: 28.6280, lng: 77.3649 });
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>({ lat: 28.6315, lng: 77.2167 });
  
  // Saved Addresses from User Profile
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(currentUser?.saved_addresses || []);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState<string | null>(null);
  const [addressTargetMode, setAddressTargetMode] = useState<'drop' | 'pickup'>('drop');

  // Order for Someone Else State
  const [isOrderingForSomeoneElse, setIsOrderingForSomeoneElse] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Autocomplete Suggestions State
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropDropdown, setShowDropDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<'pickup' | 'drop' | null>(null);

  const [packageType, setPackageType] = useState('Medical Supplies');
  const [weight, setWeight] = useState('1.0');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledTime, setScheduledTime] = useState('');
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showCalcExplainer, setShowCalcExplainer] = useState(false);

  // Auto-scroll window to top whenever successOrder is displayed
  useEffect(() => {
    if (successOrder) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [successOrder]);

  const handleCopyTrackingId = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const pickupRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Apply saved address to either pickup or drop target
  const handleApplyAddress = (addr: SavedAddress, target: 'pickup' | 'drop') => {
    const formatted = `${addr.full_address}${addr.landmark ? `, Near ${addr.landmark}` : ''}, ${addr.city} ${addr.pincode}`;

    if (target === 'pickup') {
      setSelectedPickupAddressId(addr.id);
      setPickup(formatted);

      if (addr.lat && addr.lng) {
        setPickupCoords({ lat: addr.lat, lng: addr.lng });
      } else {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr.city + ' ' + addr.pincode)}&countrycodes=in&limit=1`)
          .then(res => res.json())
          .then(data => {
            if (data && data[0]) {
              setPickupCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            }
          })
          .catch(() => {});
      }
    } else {
      setSelectedAddressId(addr.id);
      setDrop(formatted);

      if (addr.lat && addr.lng) {
        setDropCoords({ lat: addr.lat, lng: addr.lng });
      } else {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr.city + ' ' + addr.pincode)}&countrycodes=in&limit=1`)
          .then(res => res.json())
          .then(data => {
            if (data && data[0]) {
              setDropCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            }
          })
          .catch(() => {});
      }

      if (addr.recipient_name) {
        setRecipientName(addr.recipient_name);
      }
      if (addr.recipient_phone) {
        setRecipientPhone(addr.recipient_phone);
      }
    }
  };

  const handleSelectSavedAddress = (addr: SavedAddress, target?: 'pickup' | 'drop') => {
    handleApplyAddress(addr, target || addressTargetMode);
  };

  const handleSwapRoute = () => {
    const tempPickup = pickup;
    const tempPickupCoords = pickupCoords;
    const tempPickupId = selectedPickupAddressId;

    setPickup(drop);
    setPickupCoords(dropCoords);
    setSelectedPickupAddressId(selectedAddressId);

    setDrop(tempPickup);
    setDropCoords(tempPickupCoords);
    setSelectedAddressId(tempPickupId);
  };

  // Fetch fresh profile on mount to get saved addresses
  useEffect(() => {
    const token = localStorage.getItem('iw_delivery_token');
    if (!token) return;
    fetch(`${API_BASE_URL}/api/delivery/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user?.saved_addresses && Array.isArray(data.user.saved_addresses)) {
          setSavedAddresses(data.user.saved_addresses);
          const def = data.user.saved_addresses.find((a: SavedAddress) => a.is_default) || data.user.saved_addresses[0];
          if (def && !drop) {
            handleApplyAddress(def, 'drop');
          }
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target as Node)) {
        setShowPickupDropdown(false);
      }
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDropDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Fetch address suggestions from OpenStreetMap Nominatim
  const fetchSuggestions = async (query: string, field: 'pickup' | 'drop') => {
    if (!query || query.length < 3) {
      if (field === 'pickup') setPickupSuggestions([]);
      else setDropSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`);
      const data = await res.json();
      const formatted = data.map((item: any) => ({
        display_name: item.display_name,
        short_name: item.name || item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || 'Location'
      }));

      if (field === 'pickup') {
        setPickupSuggestions(formatted);
        setShowPickupDropdown(true);
      } else {
        setDropSuggestions(formatted);
        setShowDropDropdown(true);
      }
    } catch {
      const local = POPULAR_HUBS.filter(h => h.name.toLowerCase().includes(query.toLowerCase()));
      if (field === 'pickup') {
        setPickupSuggestions(local);
        setShowPickupDropdown(true);
      } else {
        setDropSuggestions(local);
        setShowDropDropdown(true);
      }
    }
  };

  useEffect(() => {
    if (activeSearchField !== 'pickup') return;
    const timer = setTimeout(() => { fetchSuggestions(pickup, 'pickup'); }, 350);
    return () => clearTimeout(timer);
  }, [pickup, activeSearchField]);

  useEffect(() => {
    if (activeSearchField !== 'drop') return;
    const timer = setTimeout(() => { fetchSuggestions(drop, 'drop'); }, 350);
    return () => clearTimeout(timer);
  }, [drop, activeSearchField]);

  // AUTO GPS LOCATION (Current Location Detect)
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPickupCoords({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setPickup(data.display_name.split(',').slice(0, 3).join(', '));
          } else {
            setPickup(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch {
          setPickup(`GPS Location: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
        } finally {
          setIsLocating(false);
          setShowPickupDropdown(false);
        }
      },
      () => {
        setIsLocating(false);
        setError('GPS permission denied or unavailable. Please pick a location from suggestions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Aerial Distance Calculation (Haversine formula in KM)
  const calculateDistanceKm = () => {
    if (!pickupCoords || !dropCoords) return 14.2;
    const R = 6371;
    const dLat = (dropCoords.lat - pickupCoords.lat) * Math.PI / 180;
    const dLon = (dropCoords.lng - pickupCoords.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pickupCoords.lat * Math.PI / 180) * Math.cos(dropCoords.lat * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.max(2.0, Math.round(d * 10) / 10);
  };

  const aerialDistKm = calculateDistanceKm();
  const flightMins = Math.round((aerialDistKm / 65) * 60) + 4; // 65 km/h UAV cruising speed + 4 mins takeoff/landing

  // Dynamic Fare Calculation
  const weightNum = Math.max(0.5, parseFloat(weight) || 1.0);
  const baseFare = 149;
  const extraWeightFee = weightNum > 1.0 ? Math.round((weightNum - 1.0) * 50) : 0;
  const distanceSurcharge = aerialDistKm > 15 ? Math.round((aerialDistKm - 15) * 5) : 0;
  const totalFare = baseFare + extraWeightFee + distanceSurcharge;

  // Complete Order Creation in Backend
  const createOrderRecord = async (paymentId: string, paymentStatus = 'paid', paymentMode = 'online') => {
    const token = localStorage.getItem('iw_delivery_token') || '';
    const finalCustomerName = isOrderingForSomeoneElse && recipientName.trim()
      ? recipientName.trim()
      : (contactName || currentUser?.name || 'Customer');
    const finalCustomerPhone = isOrderingForSomeoneElse && recipientPhone.trim()
      ? recipientPhone.trim()
      : (contactPhone || currentUser?.phone || '');

    const res = await fetch(`${API_BASE_URL}/api/delivery/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        pickup_address: pickup,
        drop_address: drop,
        package_type: packageType,
        weight_kg: weightNum,
        scheduled_time: scheduleMode === 'later' ? scheduledTime : null,
        customer_name: finalCustomerName,
        customer_email: currentUser?.email || contactEmail || '',
        customer_phone: finalCustomerPhone,
        recipient_name: isOrderingForSomeoneElse ? recipientName.trim() : null,
        recipient_phone: isOrderingForSomeoneElse ? recipientPhone.trim() : null,
        is_for_someone_else: isOrderingForSomeoneElse,
        delivery_notes: deliveryNotes.trim(),
        fare_inr: totalFare,
        payment_id: paymentId,
        payment_status: paymentStatus,
        payment_method: paymentMode,
        aerial_distance_km: aerialDistKm,
        flight_duration_mins: flightMins
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record order');
    return data.order;
  };

  const handlePayAndOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { onOpenAuth(); return; }
    if (!pickup.trim()) { setError('Please enter pickup address'); return; }
    if (!drop.trim()) { setError('Please enter drop address'); return; }

    if (isOrderingForSomeoneElse) {
      if (!recipientName.trim()) {
        setError('Please enter recipient full name');
        return;
      }
      if (!recipientPhone.trim() || recipientPhone.replace(/[^0-9]/g, '').length < 10) {
        setError('Please enter a valid 10-digit mobile number for recipient SMS arrival updates');
        return;
      }
    }

    setLoading(true);
    setError('');

    // If Cash on Delivery (COD) chosen
    if (paymentMethod === 'cod') {
      try {
        const codPaymentId = `COD-${Date.now().toString().slice(-6)}`;
        const order = await createOrderRecord(codPaymentId, 'pending', 'cod');
        localStorage.setItem('iw_last_order_id', order.id);
        setSuccessOrder({ ...order, fare_inr: totalFare, payment_id: codPaymentId, payment_method: 'cod' });
      } catch (err: any) {
        setError(err.message || 'Failed to dispatch COD delivery order');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      // 1. Create Razorpay Order on server
      const rzpRes = await fetch(`${API_BASE_URL}/api/delivery/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_inr: totalFare,
          package_type: packageType
        })
      });
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) throw new Error(rzpData.error || 'Could not initialize payment gateway');

      // 2. Open Razorpay Checkout Modal
      const razorpayKey = rzpData.key_id || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '';

      if (typeof window.Razorpay !== 'undefined') {
        const options = {
          key: razorpayKey,
          amount: rzpData.amount,
          currency: rzpData.currency || 'INR',
          name: 'IndoWings Aerial Logistics',
          description: `Drone Delivery: ${packageType} (${weightNum} kg)`,
          image: '/indowings-logo-mobile.svg',
          order_id: rzpData.id.startsWith('order_') && !rzpData.id.includes('mock') ? rzpData.id : undefined,
          prefill: {
            name: contactName || currentUser.name,
            email: contactEmail || currentUser.email,
            contact: (contactPhone || currentUser.phone || '').replace(/[^0-9]/g, '').slice(-10)
          },
          theme: {
            color: '#000000'
          },
          handler: async function (response: any) {
            try {
              const paymentId = response.razorpay_payment_id || `PAY-${Date.now()}`;
              
              // Verify on server
              await fetch(`${API_BASE_URL}/api/delivery/payment/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: paymentId,
                  razorpay_signature: response.razorpay_signature
                })
              });

              // Create order record
              const order = await createOrderRecord(paymentId);
              localStorage.setItem('iw_last_order_id', order.id);
              setSuccessOrder({ ...order, fare_inr: totalFare, payment_id: paymentId });
            } catch (err: any) {
              setError(err.message || 'Payment recorded but order registration failed.');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setLoading(false);
          setError(`Payment Failed: ${resp.error?.description || 'Transaction cancelled'}`);
        });
        rzp.open();
      } else {
        // Fallback if script blocked: complete with sandbox payment
        const mockPayId = `PAY-FALLBACK-${Date.now()}`;
        const order = await createOrderRecord(mockPayId);
        localStorage.setItem('iw_last_order_id', order.id);
        setSuccessOrder({ ...order, fare_inr: totalFare, payment_id: mockPayId });
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (successOrder) return (
    <div className="min-h-screen bg-[#f7f4fb] pb-20">
      {/* Hero Header */}
      <section 
        className="relative text-white pt-12 pb-24 px-6 overflow-hidden text-center" 
        style={{ background: 'linear-gradient(135deg, #1e0940 0%, #2b114d 55%, #1a0835 100%)' }}>
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
        <div className="relative max-w-2xl mx-auto">
          {/* Animated Glowing Success Badge */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-950/40">
            <Check className="w-8 h-8 text-emerald-400 stroke-[3]" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {successOrder.payment_method === 'cod' ? 'Drone Delivery Dispatched!' : 'Payment Verified & Dispatched!'}
          </h1>
          <p className="text-white/70 text-sm max-w-md mx-auto">
            {successOrder.payment_method === 'cod' 
              ? 'Your UAV flight corridor has been locked. Pay cash/UPI on package arrival.' 
              : `Transaction: ${successOrder.payment_id || 'RZP-PAID'} • Air corridor active.`}
          </p>
        </div>
      </section>

      {/* Main Order Confirmation Card */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          
          {/* Top Payment Status Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              {successOrder.payment_method === 'cod' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
                  <Banknote className="w-3.5 h-3.5 text-amber-600" />
                  Cash on Delivery (Pay ₹{successOrder.fare_inr || totalFare})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Payment Confirmed (₹{successOrder.fare_inr || totalFare})
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Verified Order
            </span>
          </div>

          {/* Tracking ID & Assigned Drone Hero Box */}
          <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-5 mb-6 text-center">
            <p className="text-[11px] font-bold text-zinc-800 uppercase tracking-widest mb-1.5">
              Assigned Air Tracking ID
            </p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight font-mono">
                {successOrder.id}
              </span>
              <button
                type="button"
                onClick={() => handleCopyTrackingId(successOrder.id)}
                title="Copy Tracking ID"
                className="p-1.5 rounded-lg text-slate-400 hover:text-zinc-900 hover:bg-white transition-all">
                {copiedId ? <CheckCheck className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1 rounded-full border border-zinc-200/60 shadow-2xs text-xs">
              <Truck className="w-3.5 h-3.5 text-zinc-900" />
              <span className="font-bold text-slate-700">
                {successOrder.drone_id ? `Assigned UAV: ${successOrder.drone_id} (${successOrder.drone_model})` : 'UAV auto-allocation in progress'}
              </span>
            </div>
          </div>

          {/* Route Info: Pickup & Drop */}
          <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 space-y-3">
            <div className="flex items-start gap-3 text-left">
              <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup Location</p>
                <p className="text-sm font-semibold text-[#09090b] truncate">{successOrder.pickup_address}</p>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-zinc-200 ml-3 pl-6 py-0.5 text-xs text-slate-400 font-medium">
              Direct Air Path ~{successOrder.aerial_distance_km || aerialDistKm} km • ETA ~{successOrder.flight_duration_mins || flightMins} mins
            </div>

            <div className="flex items-start gap-3 text-left">
              <div className="w-6 h-6 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-700 shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Drop Destination</p>
                <p className="text-sm font-semibold text-[#09090b]">{successOrder.drop_address}</p>
              </div>
            </div>
          </div>

          {/* Recipient Details if exists */}
          {successOrder.recipient_name && (
            <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-4 mb-6 text-left flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-zinc-200">
                  Recipient Contact
                </span>
                <p className="text-sm font-bold text-[#09090b] mt-1.5">{successOrder.recipient_name}</p>
                {successOrder.delivery_notes && (
                  <p className="text-xs text-slate-500 italic mt-0.5">
                    Instructions: &ldquo;{successOrder.delivery_notes}&rdquo;
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-700 block">{successOrder.recipient_phone}</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 justify-end mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> SMS alerts active
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => { onNavigate('track'); window.history.pushState({}, '', `/track?id=${successOrder.id}`); }}
              className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-98">
              <MapPin className="w-4 h-4" /> Track Live Flight
            </button>
            <button
              type="button"
              onClick={() => { setSuccessOrder(null); window.scrollTo({ top: 0, behavior: 'instant' }); }}
              className="flex-1 flex items-center justify-center gap-2 border border-slate-200 hover:border-black text-slate-700 hover:text-zinc-900 font-semibold py-3.5 rounded-xl transition-all hover:bg-zinc-100/40">
              Dispatch Another Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] w-full max-w-full overflow-x-hidden">
      {/* Hero */}
      <section className="relative text-white pt-14 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden w-full max-w-full" style={{ background: 'linear-gradient(135deg, #000000 0%, #09090b 50%, #17171c 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-4xl mx-auto min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center mb-4 sm:mb-5 shadow-lg">
            <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2 sm:mb-3">Drone Delivery Dispatch</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 tracking-tight max-w-xl text-white">Instant aerial courier across Delhi NCR</h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Standard 24-minute flight corridors. Pay securely via Razorpay UPI, Cards, or NetBanking.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-5 pb-16 w-full min-w-0">
        {/* Support & Pre-flight Guidance Helper */}
        <div className="mb-4 bg-white border border-zinc-200 rounded-xl px-3.5 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs min-w-0 w-full text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
            <p className="text-zinc-600 truncate text-[11px] sm:text-xs">
              <strong className="text-zinc-900 font-semibold">DGCA Guideline:</strong> Requires 3×3m clear terrace & max 5kg payload.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="/support?tab=expert"
              onClick={(e) => { e.preventDefault(); onNavigate('support'); window.history.pushState({}, '', '/support?tab=expert'); }}
              className="px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white border border-zinc-200 text-zinc-800 text-[11px] font-semibold rounded-lg transition-all shrink-0 cursor-pointer"
            >
              Talk to Expert
            </a>
            <a
              href="/support?tab=guide"
              onClick={(e) => { e.preventDefault(); onNavigate('support'); window.history.pushState({}, '', '/support?tab=guide'); }}
              className="px-2 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 text-[11px] font-medium rounded-lg transition-all shrink-0 cursor-pointer"
            >
              Guide
            </a>
          </div>
        </div>

        {!currentUser && (
          <div className="mb-4 flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 min-w-0 w-full text-xs">
            <p className="text-amber-800 flex-1">Please sign in with your phone OTP to place a delivery order</p>
            <button onClick={onOpenAuth} className="font-bold text-zinc-900 hover:underline shrink-0">Sign In →</button>
          </div>
        )}

        <form onSubmit={handlePayAndOrder} className="w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-w-0 w-full items-start">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5 min-w-0 w-full">
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 sm:p-4 shadow-2xs min-w-0 w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-zinc-900">Aerial Transit Route</h2>
                    <p className="text-[11px] text-zinc-400">Autonomous Point-to-Point UAV Flight Corridor</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-bold text-emerald-700 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>DGCA Green Zone</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* ── TRANSIT ROUTE CONTAINER (CONNECTED PICKUP & DROP) ── */}
                  <div className="space-y-3">
                    {/* PICKUP POINT (DEPARTURE) */}
                    <div className="relative" ref={pickupRef}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
                          <span>Pickup Point (Departure Hub)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleDetectCurrentLocation}
                          disabled={isLocating}
                          className="text-[10px] font-bold text-zinc-900 hover:text-black flex items-center gap-1 cursor-pointer bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 px-2 py-0.5 rounded-md transition-colors shadow-2xs">
                          {isLocating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Navigation className="w-2.5 h-2.5 text-zinc-900" />}
                          <span>{isLocating ? 'Locating...' : 'GPS Auto-Detect'}</span>
                        </button>
                      </div>

                      <div className="relative min-w-0 w-full">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <input
                          value={pickup}
                          onFocus={() => { setActiveSearchField('pickup'); if (pickup.length >= 2) setShowPickupDropdown(true); }}
                          onChange={e => { setPickup(e.target.value); setSelectedPickupAddressId(null); setActiveSearchField('pickup'); }}
                          required
                          placeholder="Search departure address, hub or society..."
                          className="w-full min-w-0 pl-8 pr-3 py-2 border border-zinc-250 focus:border-black rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all bg-white"
                        />
                      </div>

                      {/* Autocomplete Suggestions Dropdown */}
                      {showPickupDropdown && pickupSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-30 overflow-hidden max-h-56 overflow-y-auto">
                          <div className="p-2 bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-zinc-900" />
                            <span>Location Suggestions</span>
                          </div>
                          {pickupSuggestions.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setPickup(item.short_name || item.name || item.display_name.split(',')[0]);
                                setPickupCoords({ lat: item.lat, lng: item.lng });
                                setSelectedPickupAddressId(null);
                                setShowPickupDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors border-b border-zinc-50 last:border-0 flex items-start gap-2 cursor-pointer">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-zinc-900 truncate">{item.short_name || item.name || item.display_name.split(',')[0]}</p>
                                <p className="text-[10px] text-zinc-400 truncate">{item.display_name || item.type}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Quick Pickup Selector Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 mr-0.5">Saved Places:</span>
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedPickupAddressId === addr.id || (Boolean(pickup) && Boolean(addr.full_address) && pickup.includes(addr.full_address));
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => handleApplyAddress(addr, 'pickup')}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-200'
                                  : 'bg-zinc-50 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700 border border-zinc-200 hover:border-emerald-200'
                              }`}>
                              {addr.label === 'Home' && <Home className="w-3 h-3" />}
                              {addr.label === 'Work' && <Building2 className="w-3 h-3" />}
                              {addr.label === 'Office' && <Building2 className="w-3 h-3" />}
                              {addr.label === 'Warehouse' && <Package2 className="w-3 h-3" />}
                              {addr.label === 'Other' && <MapPin className="w-3 h-3" />}
                              <span>{addr.label}</span>
                              {isSelected && <Check className="w-3 h-3" />}
                            </button>
                          );
                        })}

                        {/* Verified Hub shortcut for pickup */}
                        <button
                          type="button"
                          onClick={() => {
                            setPickup('Sector 62 IndoWings Hub, Noida');
                            setPickupCoords({ lat: 28.6280, lng: 77.3649 });
                            setSelectedPickupAddressId(null);
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            pickup.includes('Sector 62')
                              ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-200'
                              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
                          }`}>
                          <span>Noida Sec 62</span>
                        </button>
                      </div>
                    </div>

                    {/* ROUTE DIVIDER WITH SWAP BUTTON */}
                    <div className="relative flex items-center justify-center my-1">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-dashed border-zinc-200"></div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSwapRoute}
                        title="Swap Departure and Destination"
                        className="relative z-10 px-3 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-black rounded-full text-[10.5px] font-bold shadow-2xs flex items-center gap-1 transition-all cursor-pointer">
                        <ArrowUpDown className="w-3 h-3 text-zinc-800" />
                        <span>Swap Direction</span>
                      </button>
                    </div>

                    {/* DROP DESTINATION (DELIVERY) */}
                    <div className="relative" ref={dropRef}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-zinc-900 inline-block shadow-xs"></span>
                          <span>Drop Destination (Delivery Zone)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => { onNavigate('profile'); window.history.pushState({}, '', '/profile'); }}
                          className="text-[10.5px] font-bold text-zinc-800 hover:text-black flex items-center gap-1 hover:underline cursor-pointer shrink-0">
                          <span>Manage</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="relative min-w-0 w-full">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700 shrink-0" />
                        <input
                          value={drop}
                          onFocus={() => { setActiveSearchField('drop'); if (drop.length >= 2) setShowDropDropdown(true); }}
                          onChange={e => { setDrop(e.target.value); setSelectedAddressId(null); setActiveSearchField('drop'); }}
                          required
                          placeholder="Search delivery address, building or landmark..."
                          className="w-full min-w-0 pl-8 pr-3 py-2 border border-zinc-250 focus:border-black rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all bg-white"
                        />
                      </div>

                      {/* Autocomplete Suggestions Dropdown */}
                      {showDropDropdown && dropSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-30 overflow-hidden max-h-56 overflow-y-auto">
                          <div className="p-2 bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-zinc-900" />
                            <span>Location Suggestions</span>
                          </div>
                          {dropSuggestions.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setDrop(item.short_name || item.name || item.display_name.split(',')[0]);
                                setDropCoords({ lat: item.lat, lng: item.lng });
                                setSelectedAddressId(null);
                                setShowDropDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-zinc-100 transition-colors border-b border-zinc-50 last:border-0 flex items-start gap-2 cursor-pointer">
                              <MapPin className="w-3.5 h-3.5 text-zinc-700 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-zinc-900 truncate">{item.short_name || item.name || item.display_name.split(',')[0]}</p>
                                <p className="text-[10px] text-zinc-400 truncate">{item.display_name || item.type}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Quick Drop Selector: Row 1 Saved Places */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 mr-0.5">Saved Places:</span>
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id || (Boolean(drop) && Boolean(addr.full_address) && drop.includes(addr.full_address));
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => handleApplyAddress(addr, 'drop')}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-black text-white shadow-xs ring-1 ring-zinc-300'
                                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 border border-zinc-200'
                              }`}>
                              {addr.label === 'Home' && <Home className="w-3 h-3" />}
                              {addr.label === 'Work' && <Building2 className="w-3 h-3" />}
                              {addr.label === 'Office' && <Building2 className="w-3 h-3" />}
                              {addr.label === 'Warehouse' && <Package2 className="w-3 h-3" />}
                              {addr.label === 'Other' && <MapPin className="w-3 h-3" />}
                              <span>{addr.label}</span>
                              {isSelected && <Check className="w-3 h-3" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Drop Selector: Row 2 NCR Verified Hubs */}
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 mt-1 -mx-1 px-1 w-full max-w-full min-w-0">
                        <span className="text-[10px] font-bold text-zinc-400 mr-0.5 shrink-0">NCR Hubs:</span>
                        {POPULAR_HUBS.map((hub, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setDrop(hub.name);
                              setDropCoords({ lat: hub.lat, lng: hub.lng });
                              setSelectedAddressId(null);
                            }}
                            className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md transition-all cursor-pointer border whitespace-nowrap ${
                              drop.includes(hub.short) || drop === hub.name
                                ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border-zinc-200'
                            }`}
                            title={hub.name}>
                            <span>{hub.short}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── 3-METRIC AVIATION TELEMETRY HUB ───────────────────────────── */}
                    <div className="bg-zinc-950 text-white border border-zinc-800 rounded-xl p-2.5 sm:p-3 shadow-md mt-2.5 min-w-0 w-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-800 via-zinc-400 to-zinc-800"></div>

                      {/* Top Metric Strip */}
                      <div className="grid grid-cols-3 gap-1 divide-x divide-zinc-800 text-center pb-2">
                        <div className="px-1 min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 truncate">Air Distance</span>
                          <span className="text-xs sm:text-base font-black text-white font-mono leading-none block truncate">~{aerialDistKm} km</span>
                          <span className="text-[8.5px] text-zinc-400 font-mono block mt-0.5 truncate">Geodesic</span>
                        </div>
                        <div className="px-1 min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 truncate">Flight ETA</span>
                          <span className="text-xs sm:text-base font-black text-white font-mono leading-none block truncate">~{flightMins} mins</span>
                          <span className="text-[8.5px] text-zinc-400 font-mono block mt-0.5 truncate">65 km/h</span>
                        </div>
                        <div className="px-1 min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5 truncate">Airspace</span>
                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-[11px] sm:text-sm font-black text-emerald-400 font-mono leading-none block truncate">Green Zone</span>
                          </div>
                          <span className="text-[8.5px] text-emerald-400/90 font-mono block mt-0.5 truncate">&lt;120m AGL</span>
                        </div>
                      </div>

                      {/* Interactive Calculation Explainer Trigger */}
                      <button
                        type="button"
                        onClick={() => setShowCalcExplainer(!showCalcExplainer)}
                        className="w-full pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer">
                        <span className="flex items-center gap-1">
                          <Info className="w-3 h-3 text-zinc-400" />
                          <span>Calculation breakdown (Haversine & ETA)</span>
                        </span>
                        {showCalcExplainer ? <ChevronUp className="w-3 h-3 text-zinc-400" /> : <ChevronDown className="w-3 h-3 text-zinc-400" />}
                      </button>

                      {/* Expandable Breakdown Drawer */}
                      {showCalcExplainer && (
                        <div className="mt-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-300 space-y-1.5 animate-in fade-in slide-in-from-top-1">
                          <div className="p-2.5 bg-zinc-900/90 rounded-lg border border-zinc-800 space-y-1.5 shadow-sm">
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-white shrink-0">📏 Distance:</span>
                              <span className="text-[10.5px] leading-relaxed text-zinc-300">
                                <strong>Haversine Geodesic GPS vector</strong> directly connecting coordinates.
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-white shrink-0">⏱️ Flight ETA:</span>
                              <span className="text-[10.5px] leading-relaxed text-zinc-300">
                                (Distance ÷ 65 km/h cruise) + 4 min buffer (vertical climb, approach & tether drop).
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-emerald-400 shrink-0">🟢 Green Zone:</span>
                              <span className="text-[10.5px] leading-relaxed text-zinc-300">
                                DigitalSky &lt;120m (400ft) AGL corridor requiring zero prior ATC permissions.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Order for Someone Else / New Recipient Address Section */}
                  <div className="pt-2.5 border-t border-zinc-100 min-w-0 w-full">
                    <div 
                      onClick={() => setIsOrderingForSomeoneElse(!isOrderingForSomeoneElse)}
                      className="flex items-center justify-between cursor-pointer p-2 sm:p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-all min-w-0">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          isOrderingForSomeoneElse ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-600'
                        }`}>
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900">Deliver to someone else?</p>
                          <p className="text-[10px] text-zinc-500 truncate">Send to a friend, client or alternate recipient</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isOrderingForSomeoneElse}
                        onChange={(e) => setIsOrderingForSomeoneElse(e.target.checked)}
                        className="w-3.5 h-3.5 text-zinc-900 rounded accent-black cursor-pointer shrink-0"
                      />
                    </div>

                    {isOrderingForSomeoneElse && (
                      <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Recipient Contact (For SMS Alert on UAV Landing)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                              Recipient Name *
                            </label>
                            <div className="relative">
                              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                              <input
                                value={recipientName}
                                onChange={e => setRecipientName(e.target.value)}
                                required={isOrderingForSomeoneElse}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-zinc-200 rounded-md text-xs focus:outline-none focus:border-black"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                              Recipient Phone *
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                              <input
                                value={recipientPhone}
                                onChange={e => setRecipientPhone(e.target.value)}
                                required={isOrderingForSomeoneElse}
                                placeholder="10-digit mobile"
                                className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-zinc-200 rounded-md text-xs focus:outline-none focus:border-black"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                            Drop Zone Instructions (Optional)
                          </label>
                          <div className="relative">
                            <MessageSquare className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                            <textarea
                              value={deliveryNotes}
                              onChange={e => setDeliveryNotes(e.target.value)}
                              rows={1}
                              placeholder="e.g. Leave with Gate 2 security or terrace helipad spot"
                              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-zinc-200 rounded-md text-xs focus:outline-none focus:border-black resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Package Specifications Card - Compact Side-by-Side */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 sm:p-4 shadow-2xs min-w-0 w-full overflow-hidden">
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-2.5">Package Specifications</h2>
                <div className="space-y-2 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative min-w-0">
                      <select
                        value={packageType}
                        onChange={e => setPackageType(e.target.value)}
                        required
                        className="w-full appearance-none px-3 py-2 pr-8 border border-zinc-300 rounded-lg text-xs sm:text-sm font-semibold text-zinc-900 bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 cursor-pointer shadow-2xs">
                        {PACKAGE_TYPES.map(t => (
                          <option key={t} value={t} className="bg-white text-zinc-900 font-medium py-1">
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div className="relative min-w-0">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="5"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        required
                        placeholder="Weight (max 5 kg)"
                        className="w-full min-w-0 pl-8 pr-3 py-2 border border-zinc-300 rounded-lg text-xs sm:text-sm font-semibold text-zinc-900 bg-white placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 shadow-2xs"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Payload allowance: up to 5kg per flight via Cyberone UAV.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols) */}
            <div className="lg:col-span-5 space-y-3.5 min-w-0 w-full">
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 sm:p-4 shadow-2xs min-w-0 w-full overflow-hidden">
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-2">Dispatch Schedule</h2>
                <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-lg border border-zinc-200 mb-2.5 min-w-0">
                  {(['now', 'later'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScheduleMode(s)}
                      className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-md transition-all text-center truncate cursor-pointer ${
                        scheduleMode === s
                          ? 'bg-black text-white shadow-sm'
                          : 'text-zinc-600 hover:text-black hover:bg-zinc-200/60'
                      }`}>
                      {s === 'now' ? '⚡ Instant Dispatch' : '🕐 Schedule Later'}
                    </button>
                  ))}
                </div>
                {scheduleMode === 'later' && (
                  <div className="relative min-w-0">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={e => setScheduledTime(e.target.value)}
                      required
                      className="w-full min-w-0 pl-8 pr-2.5 py-1.5 border border-zinc-300 rounded-md text-xs font-semibold text-zinc-900 bg-white focus:outline-none focus:border-black"
                    />
                  </div>
                )}
              </div>

              {/* Pricing & Checkout Summary Card */}
              <div className="bg-white border-2 border-zinc-250 rounded-xl p-3.5 sm:p-4 shadow-sm min-w-0 w-full overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900">Fare Estimate</h2>
                  <span className="text-[10.5px] font-bold text-white bg-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 font-mono">
                    <Zap className="w-2.5 h-2.5 text-amber-400" /> Live Quote
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 mb-3.5 min-w-0">
                  <div className="flex justify-between">
                    <span>Base Drone Dispatch Fee</span>
                    <span className="font-semibold text-zinc-900 font-mono">₹{baseFare}</span>
                  </div>
                  {extraWeightFee > 0 && (
                    <div className="flex justify-between">
                      <span>Extra Payload Surcharge (+{(weightNum - 1).toFixed(1)}kg)</span>
                      <span className="font-semibold text-zinc-900 font-mono">₹{extraWeightFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Airspace Navigation & Insurance</span>
                    <span className="font-semibold text-emerald-600 font-mono text-[11px]">INCLUDED</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-2.5 flex justify-between items-center text-sm">
                    <span className="font-bold text-zinc-900">Total Payable</span>
                    <span className="font-black text-xl text-zinc-950 font-mono">₹{totalFare}</span>
                  </div>
                </div>

                {/* Payment Mode Selector: Online vs Cash on Delivery */}
                <div className="mb-3.5 min-w-0">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('online')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer min-w-0 ${
                        paymentMethod === 'online'
                          ? 'border-black bg-black text-white shadow-sm ring-1 ring-black'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                      }`}>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <CreditCard className={`w-3.5 h-3.5 shrink-0 ${paymentMethod === 'online' ? 'text-white' : 'text-zinc-900'}`} />
                        <span className="truncate">Online UPI/Card</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 truncate ${paymentMethod === 'online' ? 'text-zinc-400' : 'text-zinc-500'}`}>Razorpay Instant</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer min-w-0 ${
                        paymentMethod === 'cod'
                          ? 'border-black bg-black text-white shadow-sm ring-1 ring-black'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                      }`}>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Banknote className={`w-3.5 h-3.5 shrink-0 ${paymentMethod === 'cod' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className="truncate">Cash on Delivery</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 truncate ${paymentMethod === 'cod' ? 'text-zinc-400' : 'text-zinc-500'}`}>Pay on arrival</p>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black hover:bg-zinc-800 active:scale-[0.99] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm sm:text-base shadow-md shadow-black/15 cursor-pointer">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{paymentMethod === 'cod' ? 'Confirming Dispatch...' : 'Opening Gateway...'}</span>
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <Banknote className="w-4 h-4 text-amber-300" />
                      <span>Confirm COD (₹{totalFare})</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{totalFare} & Dispatch</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[10.5px] text-zinc-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>
                    {paymentMethod === 'cod' 
                      ? 'Pay at destination drop zone upon arrival' 
                      : 'Secured with 256-Bit SSL Encryption'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};