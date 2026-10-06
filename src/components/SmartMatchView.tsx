import React, { useState, useMemo } from 'react';
import { Compass, ArrowRight, PlusCircle, CheckCircle2 } from 'lucide-react';
import {
  MATERIAL_BENCHMARKS,
  MUMBAI_NAVI_MUMBAI_HUBS,
  ProjectNeed,
  SurplusListing,
  rankSmartMatches,
} from '../data/yardstockEngine';
import { Translations } from '../data/i18n';

interface SmartMatchViewProps {
  t: Translations;
  projectNeeds: ProjectNeed[];
  listings: SurplusListing[];
  onAddProjectNeed: (need: ProjectNeed) => void;
  onBookEscrow: (listing: SurplusListing) => void;
}

export const SmartMatchView: React.FC<SmartMatchViewProps> = ({
  t,
  projectNeeds,
  listings,
  onAddProjectNeed,
  onBookEscrow,
}) => {
  const [selectedNeedId, setSelectedNeedId] = useState<string>(
    projectNeeds[0]?.id || 'NEED-401'
  );
  const [showNewForm, setShowNewForm] = useState<boolean>(false);

  // New Project Need form states
  const [newTitle, setNewTitle] = useState<string>('Vashi Flyover Pier Cap Shuttering & Rebar');
  const [newCompany, setNewCompany] = useState<string>('Mhatre Civil Infra Pvt Ltd');
  const [newLocality, setNewLocality] = useState<string>(MUMBAI_NAVI_MUMBAI_HUBS[10].name);
  const [newMaterialId, setNewMaterialId] = useState<string>('mat-rebar');
  const [newQty, setNewQty] = useState<number>(18);
  const [newRadiusKm, setNewRadiusKm] = useState<number>(10);
  const [newBudget, setNewBudget] = useState<number>(4900);
  const [newUrgency, setNewUrgency] = useState<ProjectNeed['urgency']>('Immediate (24h)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeNeed =
    projectNeeds.find((n) => n.id === selectedNeedId) || projectNeeds[0];

  const rankedMatches = useMemo(() => {
    if (!activeNeed) return [];
    return rankSmartMatches(activeNeed, listings).slice(0, 8);
  }, [activeNeed, listings]);

  const handleCreateNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/smart-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: newTitle,
          buyerCompany: newCompany,
          localityName: newLocality,
          maxRadiusKm: newRadiusKm,
          materialId: newMaterialId,
          requiredQty: newQty,
          maxBudgetPerUnitInr: newBudget,
          urgency: newUrgency,
        }),
      });
      const data = await res.json();
      if (res.ok && data.need) {
        onAddProjectNeed(data.need);
        setSelectedNeedId(data.need.id);
        setShowNewForm(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-700">
            02. PostGIS ST_DWithin Micro-Radius Procurement Matching
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {t.smartMatchHeader}
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-3xl">{t.smartMatchSubheader}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewForm(!showNewForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors min-h-[40px]"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>{showNewForm ? 'Close Form' : 'Post Project Requirement'}</span>
        </button>
      </div>

      {showNewForm && (
        <form
          onSubmit={handleCreateNeed}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-slate-900">
            Post Live Project Material Requirement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Project Package Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Buyer EPC / Contractor Firm
              </label>
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Project Site Hub (Mumbai / Navi Mumbai)
              </label>
              <select
                value={newLocality}
                onChange={(e) => setNewLocality(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {MUMBAI_NAVI_MUMBAI_HUBS.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name} ({h.zone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Required Material Category
              </label>
              <select
                value={newMaterialId}
                onChange={(e) => {
                  const m = MATERIAL_BENCHMARKS.find((x) => x.id === e.target.value);
                  setNewMaterialId(e.target.value);
                  if (m) setNewBudget(Math.round(m.benchmarkRateInr * 0.75));
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {MATERIAL_BENCHMARKS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.category} ({m.cpwdCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Required Quantity & Max Radius (km)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={1}
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  placeholder="Qty"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
                />
                <input
                  type="number"
                  min={2}
                  max={40}
                  value={newRadiusKm}
                  onChange={(e) => setNewRadiusKm(Number(e.target.value))}
                  placeholder="Radius km"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Unit Budget (₹) & Urgency
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={50}
                  value={newBudget}
                  onChange={(e) => setNewBudget(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
                />
                <select
                  value={newUrgency}
                  onChange={(e) =>
                    setNewUrgency(e.target.value as ProjectNeed['urgency'])
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900"
                >
                  <option value="Immediate (24h)">Immediate (24h)</option>
                  <option value="Within 3 Days">Within 3 Days</option>
                  <option value="Standard (7 Days)">Standard (7 Days)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
            >
              {isSubmitting ? 'Matching...' : 'Run PostGIS Smart-Match'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 4 Cols: Active Project Needs Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Active Buyer Project Needs ({projectNeeds.length})
          </h2>
          {projectNeeds.map((need) => {
            const active = need.id === activeNeed?.id;
            return (
              <button
                key={need.id}
                type="button"
                onClick={() => setSelectedNeedId(need.id)}
                className={`w-full text-left rounded-xl p-4 border transition-all ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono tabular-nums opacity-80">
                  <span>{need.id}</span>
                  <span>Radius ≤ {need.maxRadiusKm} km</span>
                </div>
                <h3 className="text-sm font-semibold mt-1">{need.projectTitle}</h3>
                <p
                  className={`text-xs mt-1 ${
                    active ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {need.buyerCompany} · {need.locality}
                </p>
                <div
                  className={`mt-3 pt-2.5 border-t text-xs font-mono tabular-nums flex items-center justify-between ${
                    active
                      ? 'border-slate-800 text-amber-300'
                      : 'border-slate-100 text-slate-700'
                  }`}
                >
                  <span>
                    Need: {need.requiredQty} {need.unit.split(' ')[0]} ({need.category})
                  </span>
                  <span>Max ₹{need.maxBudgetPerUnitInr}/u</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right 8 Cols: Ranked Matches with Explainable "Why Matched" Reasons */}
        <div className="lg:col-span-8 space-y-4">
          {activeNeed && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">
                  Ranked Surplus Matches for <strong className="text-slate-900">{activeNeed.projectTitle}</strong>
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono tabular-nums">
                  Center: {activeNeed.locality} ({activeNeed.lat.toFixed(4)}, {activeNeed.lng.toFixed(4)}) · ST_DWithin ≤ {activeNeed.maxRadiusKm} km · Urgency: {activeNeed.urgency}
                </div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-lg font-bold text-slate-900">
                  {rankedMatches.length} Verified Lots
                </div>
                <div className="text-xs text-emerald-700">Precision@5 Verified</div>
              </div>
            </div>
          )}

          {rankedMatches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
              <Compass className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-semibold text-slate-900">
                No verified lots within {activeNeed?.maxRadiusKm} km
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try posting a requirement with a wider micro-radius (e.g. 18 km across Mumbai / Navi Mumbai) to include neighboring MIDC yards.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rankedMatches.map((match, idx) => (
                <div
                  key={match.listing.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="w-full sm:w-44 h-32 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={match.listing.imageUrl}
                        alt={match.listing.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {/* Zero-pill metadata line */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono tabular-nums">
                        <span>
                          Rank #{idx + 1} · Match Score {match.matchScore}/100 · {match.distanceKm} km away · {match.listing.cpwdCode}
                        </span>
                        <span className="font-semibold text-emerald-700">
                          Seller Trust {match.listing.sellerTrustScore}/100
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {match.listing.title}
                        </h3>
                        <div className="text-right font-mono tabular-nums">
                          <span className="text-lg font-bold text-slate-900">
                            ₹{match.listing.listedPriceInr.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-500">
                            {' '}
                            / {match.listing.unit} (DSR ₹{match.listing.benchmarkPriceInr})
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600">
                        Available: <strong className="font-mono tabular-nums text-slate-900">{match.listing.quantity} {match.listing.unit}</strong> · Condition: {match.listing.condition} · Seller: {match.listing.sellerCompany}
                      </div>

                      {/* Explainable "Why Matched" Reasons */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-800">
                          Explainable AI — Why This Lot Matched:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {match.whyMatchedReasons.map((reason, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-start gap-1.5 text-xs text-slate-700"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-slate-500 font-mono tabular-nums">
                          Est. Savings: <strong className="text-emerald-700">₹{match.priceSavingsInr.toLocaleString('en-IN')}</strong> · Embodied Carbon Avoided: <strong className="text-slate-800">{match.co2AvoidedKg} kg CO₂e</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => onBookEscrow(match.listing)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors min-h-[38px]"
                        >
                          <span>{t.bookEscrowBtn}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
