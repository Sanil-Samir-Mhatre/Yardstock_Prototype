import React, { useState } from 'react';
import { Phone, KeyRound, ShieldCheck, X } from 'lucide-react';
import { UserRole, MUMBAI_NAVI_MUMBAI_HUBS } from '../data/yardstockEngine';

export interface AuthSession {
  authenticated: boolean;
  jwtToken: string;
  user: {
    id: string;
    name: string;
    phoneMasked: string;
    role: UserRole;
    locality: string;
    trustScore: number;
    gstVerified: boolean;
  };
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: AuthSession;
  onAuthenticated: (newSession: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  session,
  onAuthenticated,
}) => {
  const [phone, setPhone] = useState<string>('9820148290');
  const [otp, setOtp] = useState<string>('492018');
  const [name, setName] = useState<string>(session.user.name);
  const [role, setRole] = useState<UserRole>(session.user.role);
  const [locality, setLocality] = useState<string>(session.user.locality);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, role, name, locality }),
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        onAuthenticated(data);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Zero-Trust Phone OTP & RBAC Session
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch RBAC role (Buyer / Seller / Admin) & verify JWT claim
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Contractor / Engineer Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone (+91)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm font-mono tabular-nums text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                6-Digit SMS OTP
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-amber-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm font-mono tabular-nums text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              RBAC Role Assignment
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-lg">
              {(['seller', 'buyer', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                    role === r
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Primary Site Yard Hub
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {MUMBAI_NAVI_MUMBAI_HUBS.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name} ({h.zone})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-[11px] font-mono text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-semibold font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Signed JWT Claim:</span>
            </div>
            <div className="truncate">{session.jwtToken}</div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-slate-900 py-2.5 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition-colors min-h-[42px]"
          >
            {isLoading ? 'Verifying OTP...' : 'Verify OTP & Update RBAC Session'}
          </button>
        </form>
      </div>
    </div>
  );
};
