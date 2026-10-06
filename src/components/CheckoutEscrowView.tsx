import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Truck,
  KeyRound,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import {
  SurplusListing,
  EscrowOrder,
  SecurityEventLog,
} from '../data/yardstockEngine';
import { Translations } from '../data/i18n';

interface CheckoutEscrowViewProps {
  t: Translations;
  selectedListing: SurplusListing;
  escrowOrders: EscrowOrder[];
  onOrderCreated: (order: EscrowOrder) => void;
  onOrderVerified: (order: EscrowOrder, auditEntry: SecurityEventLog) => void;
}

const VEHICLES: Array<{
  name: EscrowOrder['logisticsVehicle'];
  capacity: string;
  feeInr: number;
  eta: string;
}> = [
  {
    name: 'Tata Ace EV (750 kg)',
    capacity: 'Up to 750 kg · Zero-Emission City Tempo',
    feeInr: 890,
    eta: '35 mins arrival',
  },
  {
    name: 'Mahindra Bolero Pickup (1.5T)',
    capacity: 'Up to 1,500 kg · Heavy Site Utility',
    feeInr: 1450,
    eta: '45 mins arrival',
  },
  {
    name: 'Eicher Pro 2049 (5T)',
    capacity: 'Up to 5,000 kg · Bulk Pallets & Rebar',
    feeInr: 2850,
    eta: '65 mins arrival',
  },
];

export const CheckoutEscrowView: React.FC<CheckoutEscrowViewProps> = ({
  t,
  selectedListing,
  escrowOrders,
  onOrderCreated,
  onOrderVerified,
}) => {
  const [orderQty, setOrderQty] = useState<number>(
    Math.min(10, selectedListing.quantity)
  );
  const [selectedVehicle, setSelectedVehicle] = useState<
    EscrowOrder['logisticsVehicle']
  >('Mahindra Bolero Pickup (1.5T)');
  const [buyerName, setBuyerName] = useState<string>(
    'Sanil Mhatre — Site Procurement Engineer'
  );
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // OTP verification state
  const [activeOrderId, setActiveOrderId] = useState<string>(
    escrowOrders[0]?.id || ''
  );
  const [otpInput, setOtpInput] = useState<string>(
    escrowOrders[0]?.deliveryOtp || ''
  );
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  useEffect(() => {
    setOrderQty(Math.min(10, selectedListing.quantity));
  }, [selectedListing]);

  const vehicleObj =
    VEHICLES.find((v) => v.name === selectedVehicle) || VEHICLES[1];
  const subtotalInr = orderQty * selectedListing.listedPriceInr;
  const commissionRate = 0.065; // 6.5% commission (within 5-8% band)
  const commissionInr = Math.round(subtotalInr * commissionRate);
  const netSellerPayoutInr = subtotalInr - commissionInr;
  const totalEscrowPayableInr = subtotalInr + vehicleObj.feeInr;

  const handleLockEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      const res = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListing.id,
          buyerName,
          quantity: orderQty,
          logisticsVehicle: selectedVehicle,
        }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        onOrderCreated(data.order);
        setActiveOrderId(data.order.id);
        setOtpInput(data.order.deliveryOtp);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerifyOtp = async (order: EscrowOrder) => {
    setOtpError(null);
    setOtpSuccess(null);
    const res = await fetch('/api/escrow/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        otp: otpInput,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setOtpError(data.error || 'OTP verification failed');
      return;
    }
    setOtpSuccess(
      `OTP ${order.deliveryOtp} verified! Released ₹${(
        order.subtotalInr - order.commissionInr
      ).toLocaleString('en-IN')} to ${
        order.sellerName
      } and retained ₹${order.commissionInr.toLocaleString(
        'en-IN'
      )} (6.5% commission).`
    );
    onOrderVerified(data.order, data.auditEntry);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-medium text-amber-700">
          03. Anti-Leakage Escrow, Mini-Truck Dispatch & Delivery OTP Settlement
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          {t.escrowHeader}
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-3xl">
          {t.escrowSubheader}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 6 Cols: Book Escrow & Mini-Truck for Selected Lot */}
        <div className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleLockEscrow}
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
          >
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <img
                src={selectedListing.imageUrl}
                alt={selectedListing.title}
                referrerPolicy="no-referrer"
                className="w-24 h-20 rounded-lg object-cover bg-slate-100 shrink-0"
              />
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  {selectedListing.id} · {selectedListing.cpwdCode} · Seller Trust{' '}
                  {selectedListing.sellerTrustScore}/100
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  {selectedListing.title}
                </h2>
                <p className="text-xs text-slate-600">
                  Seller: {selectedListing.sellerName} ({selectedListing.sellerCompany})
                </p>
                <p className="text-xs text-amber-700 font-mono tabular-nums">
                  Public Map Position: {selectedListing.fuzzedLat},{' '}
                  {selectedListing.fuzzedLng} (Fuzzed ~
                  {selectedListing.fuzzRadiusMeters}m until Escrow locked)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Buyer / Site Engineer Name
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Order Quantity (Max {selectedListing.quantity}{' '}
                  {selectedListing.unit})
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedListing.quantity}
                  value={orderQty}
                  onChange={(e) =>
                    setOrderQty(
                      Math.max(
                        1,
                        Math.min(
                          selectedListing.quantity,
                          Number(e.target.value)
                        )
                      )
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums text-slate-900"
                />
              </div>
            </div>

            {/* Mini-Truck Fleet Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Select Dedicated Site Mini-Truck Dispatch
              </label>
              <div className="space-y-2">
                {VEHICLES.map((v) => {
                  const active = selectedVehicle === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVehicle(v.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50/60 text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck
                          className={`w-4 h-4 shrink-0 ${
                            active ? 'text-amber-400' : 'text-slate-600'
                          }`}
                        />
                        <div>
                          <div className="text-xs font-semibold">{v.name}</div>
                          <div
                            className={`text-[11px] ${
                              active ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {v.capacity} · {v.eta}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono tabular-nums text-xs font-semibold">
                        ₹{v.feeInr.toLocaleString('en-IN')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Itemized Escrow & 6.5% Commission Breakdown */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>
                  Material Subtotal ({orderQty} × ₹
                  {selectedListing.listedPriceInr.toLocaleString('en-IN')})
                </span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  ₹{subtotalInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Mini-Truck Dispatch ({selectedVehicle})</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  ₹{vehicleObj.feeInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-amber-800 pt-1 border-t border-slate-200">
                <span>
                  Platform Anti-Leakage Commission (6.5% retained from Seller at OTP)
                </span>
                <span className="font-mono tabular-nums font-semibold">
                  ₹{commissionInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Net Seller Payout upon Delivery OTP Verification</span>
                <span className="font-mono tabular-nums font-medium text-emerald-700">
                  ₹{netSellerPayoutInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>Total Buyer Escrow Deposit</span>
                <span className="font-mono tabular-nums">
                  ₹{totalEscrowPayableInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors min-h-[44px]"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>
                {isCreating
                  ? 'Locking Escrow...'
                  : `Lock ₹${totalEscrowPayableInr.toLocaleString('en-IN')} in Escrow & Dispatch Truck`}
              </span>
            </button>
          </form>
        </div>

        {/* Right 6 Cols: Active Escrow Ledger & Delivery OTP Release Terminal */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Active Escrow Vault & Delivery OTP Terminal ({escrowOrders.length})
          </h2>

          {otpError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
              {otpError}
            </div>
          )}
          {otpSuccess && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{otpSuccess}</span>
            </div>
          )}

          <div className="space-y-4">
            {escrowOrders.map((order) => {
              const isReleased = order.status === 'OTP_VERIFIED_RELEASED';
              const isFocused = activeOrderId === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setActiveOrderId(order.id);
                    setOtpInput(order.deliveryOtp);
                  }}
                  className={`rounded-xl border p-5 transition-all cursor-pointer ${
                    isFocused
                      ? 'bg-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums text-slate-500">
                    <span>
                      {order.id} · Lot {order.listingId} · {order.logisticsVehicle}
                    </span>
                    <span
                      className={
                        isReleased
                          ? 'text-emerald-700 font-semibold'
                          : 'text-amber-700 font-semibold'
                      }
                    >
                      Status: {order.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 mt-1.5">
                    {order.listingTitle}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-mono tabular-nums">
                    Qty: {order.quantity} {order.unit} · Escrow Total: ₹
                    {order.totalEscrowInr.toLocaleString('en-IN')} · 6.5%
                    Commission: ₹{order.commissionInr.toLocaleString('en-IN')}
                  </p>

                  {/* Animated Escrow & Mini-Truck Dispatch Telemetry Bar */}
                  <div className="mt-3 pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>1. Funds Locked</span>
                      <span>2. {order.logisticsVehicle.split(' ')[0]} En Route</span>
                      <span>3. OTP Settlement</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isReleased ? 1 : 0.66 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: 'left' }}
                        className={`h-full rounded-full ${
                          isReleased ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Unfuzzed Exact Seller Location Revealed Post-Escrow */}
                  <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Exact Yard Pickup Unfuzzed (Escrow Verified):</span>
                    </div>
                    <p className="font-mono tabular-nums text-slate-700">
                      {order.exactPickupRevealed}
                    </p>
                  </div>

                  {!isReleased ? (
                    <div
                      className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-xs text-slate-600 font-mono tabular-nums">
                        Buyer Site Delivery OTP:{' '}
                        <strong className="text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded">
                          {order.deliveryOtp}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={
                            activeOrderId === order.id
                              ? otpInput
                              : order.deliveryOtp
                          }
                          onChange={(e) => {
                            setActiveOrderId(order.id);
                            setOtpInput(e.target.value);
                          }}
                          placeholder="6-digit OTP"
                          className="w-28 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono tabular-nums text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyOtp(order)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Verify OTP & Release Payout</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-800 font-mono tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>
                          OTP {order.deliveryOtp} Verified · Payout Settled
                        </span>
                      </span>
                      <span>
                        Commission Protected: ₹
                        {order.commissionInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
