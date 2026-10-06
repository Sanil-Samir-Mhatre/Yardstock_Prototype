/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  MapPin,
  Search,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Compass,
  Lock,
  UserCheck,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import {
  LanguageCode,
  MATERIAL_BENCHMARKS,
  MUMBAI_NAVI_MUMBAI_HUBS,
  SurplusListing,
  SellerProfile,
  ProjectNeed,
  EscrowOrder,
  SecurityEventLog,
  calculateDistanceKm,
  generateSyntheticDataset,
} from './data/yardstockEngine';
import { TRANSLATIONS } from './data/i18n';
import { MarketplaceMap } from './components/MarketplaceMap';
import { SnapAndListView } from './components/SnapAndListView';
import { SmartMatchView } from './components/SmartMatchView';
import { CheckoutEscrowView } from './components/CheckoutEscrowView';
import { SecurityCenterView } from './components/SecurityCenterView';
import {
  PerformanceDashboardView,
  DashboardMetricsData,
} from './components/PerformanceDashboardView';
import { AuthModal, AuthSession } from './components/AuthModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

type ActiveTab =
  | 'marketplace'
  | 'snap'
  | 'smart-match'
  | 'escrow'
  | 'security'
  | 'metrics';

const fallbackDataset = generateSyntheticDataset();

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('marketplace');
  const [lang, setLang] = useState<LanguageCode>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('yardstock-theme');
      if (saved) return saved === 'dark';
    }
    return false; // Crisp light mode default with 1-tap Dark Mode toggle
  });
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('yardstock-theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors in restricted iframes
    }
  }, [isDarkMode]);

  // Application Data State (hydrated from /api/state with instant client fallback)
  const [listings, setListings] = useState<SurplusListing[]>(
    fallbackDataset.listings
  );
  const [sellers, setSellers] = useState<SellerProfile[]>(
    fallbackDataset.sellers
  );
  const [projectNeeds, setProjectNeeds] = useState<ProjectNeed[]>(
    fallbackDataset.projectNeeds
  );
  const [escrowOrders, setEscrowOrders] = useState<EscrowOrder[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityEventLog[]>(
    fallbackDataset.initialAuditLogs
  );
  const [metrics, setMetrics] = useState<DashboardMetricsData | null>(null);

  // Marketplace Filters & PostGIS ST_DWithin Radius State
  const [centerHubName, setCenterHubName] = useState<string>(
    'Vashi Sector 19 APMC Axis'
  );
  const [centerLat, setCenterLat] = useState<number>(19.0771);
  const [centerLng, setCenterLng] = useState<number>(73.0076);
  const [radiusKm, setRadiusKm] = useState<number>(14);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<
    'all' | 'Mumbai' | 'Navi Mumbai' | 'Thane'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<SurplusListing>(
    fallbackDataset.listings[0]
  );

  // Zero-Trust Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authSession, setAuthSession] = useState<AuthSession>({
    authenticated: true,
    jwtToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODIwMTQ4MjkwIiwicm9sZSI6InNlbGxlciIsIm5hbWUiOiJTYW5pbCBNhatyZSJ9.9f8a7b6c5d4e3f2a',
    user: {
      id: 'USR-1001',
      name: 'Sanil Mhatre',
      phoneMasked: '+91 9820XXXX90',
      role: 'seller',
      locality: 'Vashi Sector 19 APMC Axis',
      trustScore: 92,
      gstVerified: true,
    },
  });

  useEffect(() => {
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        if (data.listings) setListings(data.listings);
        if (data.sellers) setSellers(data.sellers);
        if (data.projectNeeds) setProjectNeeds(data.projectNeeds);
        if (data.escrowOrders) setEscrowOrders(data.escrowOrders);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.metrics) setMetrics(data.metrics);
      })
      .catch(() => {
        // Offline or preview fallback already populated
      });
  }, []);

  // Filter verified listings by PostGIS ST_DWithin radius, category, zone, and search query
  const filteredListingsWithDistance = useMemo(() => {
    return listings
      .filter((item) => item.fraudStatus === 'verified')
      .map((item) => {
        const distanceKm = calculateDistanceKm(
          centerLat,
          centerLng,
          item.exactLat,
          item.exactLng
        );
        return { item, distanceKm };
      })
      .filter(({ item, distanceKm }) => {
        if (distanceKm > radiusKm) return false;
        if (
          selectedCategoryId !== 'all' &&
          item.materialId !== selectedCategoryId
        ) {
          return false;
        }
        if (selectedZone !== 'all' && item.cityZone !== selectedZone) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchLoc = item.locality.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchCode = item.cpwdCode.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchCat && !matchCode) return false;
        }
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [
    listings,
    centerLat,
    centerLng,
    radiusKm,
    selectedCategoryId,
    selectedZone,
    searchQuery,
  ]);

  const handleBookEscrow = (listing: SurplusListing) => {
    setSelectedListing(listing);
    setActiveTab('escrow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-0 transition-colors duration-200">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors duration-200">
        {/* Zone 1: Single text element wordmark in Display Face */}
        <a
          href="#marketplace"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('marketplace');
          }}
          className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          YardStock
        </a>

        {/* Zone 2: 5-6 clean text navigation links with animated layoutId underline */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {(
            [
              { id: 'marketplace', label: t.navMarketplace },
              { id: 'snap', label: t.navSnapList },
              { id: 'smart-match', label: t.navSmartMatch },
              { id: 'escrow', label: t.navCheckout },
              { id: 'security', label: t.navSecurity },
              { id: 'metrics', label: t.navMetrics },
            ] as const
          ).map((navItem) => {
            const isActive = activeTab === navItem.id;
            return (
              <button
                key={navItem.id}
                type="button"
                onClick={() => setActiveTab(navItem.id)}
                className={`relative py-5 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-slate-900 font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <span>{navItem.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavUnderline"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 2 Primary Actions (Theme/Language Control + Primary Snap Surplus CTA) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <motion.span
              key={isDarkMode ? 'dark' : 'light'}
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="inline-flex"
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-700" />
              )}
            </motion.span>
            <span>{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('snap')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-xs font-semibold text-white hover:bg-amber-500 transition-colors whitespace-nowrap shrink-0 min-h-[40px] shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
            <span>{t.ctaSnapSurplus}</span>
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px Desktop Presence with Kinetic View Transitions) */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'marketplace' && (
              <div className="space-y-8">
                {/* Clean Millennial Hero Section with Direct EN / हिंदी / मराठी Switcher & 3-Step Flow */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    <div className="lg:col-span-7 space-y-4">
                      {/* Top Bar of Hero: Location Kicker + Direct 1-Tap Language Selector (English / हिंदी / मराठी) */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold">
                          <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                          <span>{t.heroKicker}</span>
                        </div>

                        {/* Direct 3-Language Segmented Switcher */}
                        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
                          <Globe className="w-3.5 h-3.5 text-amber-600 ml-1.5 mr-0.5 shrink-0" />
                          {(
                            [
                              { code: 'en', label: 'English' },
                              { code: 'hi', label: 'हिंदी' },
                              { code: 'mr', label: 'मराठी' },
                            ] as const
                          ).map((l) => (
                            <button
                              key={l.code}
                              type="button"
                              onClick={() => setLang(l.code)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                                lang === l.code
                                  ? 'bg-white text-slate-900 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {l.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <h1 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                        {t.heroTitle}
                      </h1>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                        {t.heroSubtitle}
                      </p>

                      {/* Primary Action Buttons */}
                      <div className="pt-1 flex flex-wrap items-center gap-2.5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setActiveTab('snap')}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-amber-500 transition-colors min-h-[44px]"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{t.navSnapList} (2s)</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setActiveTab('smart-match')}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors min-h-[44px]"
                        >
                          <Compass className="w-4 h-4 text-amber-600" />
                          <span>{t.navSmartMatch}</span>
                        </motion.button>
                        <button
                          type="button"
                          onClick={() => setIsAuthOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px]"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {authSession.user.name} ({authSession.user.role})
                          </span>
                        </button>
                        <PWAInstallButton />
                      </div>
                    </div>

                    {/* Right 5 Cols: Simple 3-Step Visual How-It-Works + Quick Impact */}
                    <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 pt-5 lg:pt-0 lg:pl-8 space-y-3">
                      <div className="space-y-2.5">
                        <motion.div
                          whileHover={{ x: 3 }}
                          onClick={() => setActiveTab('snap')}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {t.step1Title}
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              {t.step1Desc}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                        </motion.div>

                        <motion.div
                          whileHover={{ x: 3 }}
                          onClick={() => setActiveTab('smart-match')}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {t.step2Title}
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              {t.step2Desc}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                        </motion.div>

                        <motion.div
                          whileHover={{ x: 3 }}
                          onClick={() => setActiveTab('escrow')}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer flex items-start justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {t.step3Title}
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              {t.step3Desc}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                        </motion.div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono tabular-nums">
                        <span>
                          {metrics
                            ? `${metrics.sustainability.wasteDivertedTons}T Waste Saved · ${metrics.sustainability.co2SavedTons}T CO₂ Saved`
                            : '1,422T Waste Saved · 974T CO₂ Saved'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('metrics')}
                          className="text-slate-900 font-sans font-semibold hover:underline"
                        >
                          {t.navMetrics} →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Simple Search, Area Selector, Distance Slider & Material Tabs */}
                <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Search input */}
                    <div className="md:col-span-4 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-amber-600 focus:outline-none"
                      />
                    </div>

                    {/* Hub Location Selector */}
                    <div className="md:col-span-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <select
                        value={centerHubName}
                        onChange={(e) => {
                          const hub = MUMBAI_NAVI_MUMBAI_HUBS.find(
                            (h) => h.name === e.target.value
                          );
                          setCenterHubName(e.target.value);
                          if (hub) {
                            setCenterLat(hub.lat);
                            setCenterLng(hub.lng);
                          }
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        {MUMBAI_NAVI_MUMBAI_HUBS.map((h) => (
                          <option key={h.name} value={h.name}>
                            Near: {h.name} ({h.zone})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Distance Slider */}
                    <div className="md:col-span-4 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2">
                      <SlidersHorizontal className="w-4 h-4 text-slate-600 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">
                            {t.radiusLabel}
                          </span>
                          <span className="font-mono tabular-nums font-bold text-amber-700">
                            Within {radiusKm} km
                          </span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={35}
                          step={1}
                          value={radiusKm}
                          onChange={(e) => setRadiusKm(Number(e.target.value))}
                          className="w-full accent-amber-600 h-1.5 mt-1 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Segmented Category & Zone Filter Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryId('all')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                          selectedCategoryId === 'all'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t.allCategories}
                      </button>
                      {MATERIAL_BENCHMARKS.map((mat) => (
                        <button
                          key={mat.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(mat.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                            selectedCategoryId === mat.id
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {mat.category}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                      {(['all', 'Mumbai', 'Navi Mumbai', 'Thane'] as const).map(
                        (zone) => (
                          <button
                            key={zone}
                            type="button"
                            onClick={() => setSelectedZone(zone)}
                            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                              selectedZone === zone
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {zone === 'all' ? 'All Areas' : zone}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </section>

                {/* Split View: Interactive Map + Selected Item Quick-Buy Card */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7">
                    <MarketplaceMap
                      centerLat={centerLat}
                      centerLng={centerLng}
                      radiusKm={radiusKm}
                      listings={filteredListingsWithDistance.map((d) => d.item)}
                      selectedListingId={selectedListing?.id || null}
                      onSelectListing={(item) => setSelectedListing(item)}
                      onChangeCenter={(lat, lng) => {
                        setCenterLat(lat);
                        setCenterLng(lng);
                        setCenterHubName('Selected Map Point');
                      }}
                    />
                  </div>

                  {/* Animated Contiguous Selected Lot Inspection & Escrow Module */}
                  <motion.div
                    key={selectedListing.id}
                    initial={{ opacity: 0.65, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                      <span>
                        {selectedListing.locality} · {selectedListing.cityZone}
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        AI Match {Math.round(selectedListing.confidence * 100)}%
                      </span>
                    </div>

                    <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-100 relative">
                      <img
                        src={selectedListing.imageUrl}
                        alt={selectedListing.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-xs text-white flex items-center justify-between font-mono tabular-nums">
                        <span>Verified Site Photo</span>
                        <span>{selectedListing.discountPct}% Off Market Rate</span>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedListing.title}
                      </h2>
                      {/* Zero-Pill Unboxed Metadata */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <span>{selectedListing.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{selectedListing.condition}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-emerald-700">
                          Saves {selectedListing.co2SavedKg} kg CO₂
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 font-mono tabular-nums">
                      <div>
                        <div className="text-2xl font-bold text-slate-900">
                          ₹{selectedListing.listedPriceInr.toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-normal text-slate-500">
                            / {selectedListing.unit}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Retail Rate: ₹
                          {selectedListing.benchmarkPriceInr.toLocaleString('en-IN')} ·
                          In Stock: {selectedListing.quantity} {selectedListing.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-700">
                          Trust {selectedListing.sellerTrustScore}/100
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans">
                          {selectedListing.sellerCompany}
                        </div>
                      </div>
                    </div>

                    {/* Simple Why Trust This Seller Box */}
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                      <div className="font-semibold text-slate-900">
                        Why This Seller is Verified:
                      </div>
                      {selectedListing.shapReasons.slice(0, 2).map((r, i) => (
                        <div key={i} className="text-slate-600 flex items-center gap-1.5">
                          <span className="text-emerald-700 font-semibold">✓</span>
                          <span>{r.reason}</span>
                        </div>
                      ))}
                      <div className="text-amber-800 text-[11px] pt-1">
                        {t.fuzzedLocationNotice}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handleBookEscrow(selectedListing)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 px-4 text-sm font-semibold text-white hover:bg-amber-500 transition-colors min-h-[44px]"
                    >
                      <span>{t.bookEscrowBtn}</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </motion.button>
                  </motion.div>
                </section>

                {/* Featured Surplus Inventory Grid (Clean Millennial Cards) */}
                <section className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Available Nearby Within {radiusKm} km ({filteredListingsWithDistance.length}{' '}
                        items)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Closest to {centerHubName} · Every photo verified for authenticity
                      </p>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      Showing {Math.min(18, filteredListingsWithDistance.length)} of{' '}
                      {filteredListingsWithDistance.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListingsWithDistance
                      .slice(0, 18)
                      .map(({ item, distanceKm }, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: Math.min(idx * 0.03, 0.25),
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          whileHover={{ y: -4 }}
                          onClick={() => setSelectedListing(item)}
                          className={`group bg-white rounded-xl border overflow-hidden cursor-pointer flex flex-col transition-colors ${
                            selectedListing.id === item.id
                              ? 'border-amber-500 ring-2 ring-amber-500/20'
                              : 'border-slate-200 hover:border-amber-500/60'
                          }`}
                        >
                          {/* Lead with Imagery */}
                          <div className="aspect-4/3 w-full bg-slate-100 overflow-hidden relative">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 py-2.5 flex items-center justify-between text-xs text-white font-mono tabular-nums">
                              <span>{distanceKm.toFixed(1)} km away</span>
                              <span>{item.discountPct}% Off</span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div className="space-y-1">
                              {/* Quiet 1-line unboxed metadata kicker */}
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <span>{item.locality}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums text-emerald-700 font-medium">
                                  Seller Score {item.sellerTrustScore}/100
                                </span>
                              </div>

                              <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
                                {item.title}
                              </h3>

                              <div className="text-xs text-slate-600">
                                {item.quantity} {item.unit} · {item.condition}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <div className="font-mono tabular-nums">
                                <span className="text-base font-bold text-slate-900">
                                  ₹{item.listedPriceInr.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {' '}
                                  / unit
                                </span>
                              </div>

                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookEscrow(item);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors whitespace-nowrap"
                              >
                                <span>Buy Safe</span>
                                <ArrowRight className="w-3 h-3 text-white" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'snap' && (
              <SnapAndListView
                t={t}
                onListingCreated={(newListing, auditEntry) => {
                  setListings((prev) => [newListing, ...prev]);
                  if (auditEntry) setAuditLogs((prev) => [auditEntry, ...prev]);
                  setSelectedListing(newListing);
                }}
                onSecurityBlocked={(auditEntry) => {
                  if (auditEntry) setAuditLogs((prev) => [auditEntry, ...prev]);
                }}
              />
            )}

            {activeTab === 'smart-match' && (
              <SmartMatchView
                t={t}
                projectNeeds={projectNeeds}
                listings={listings}
                onAddProjectNeed={(need) => setProjectNeeds((prev) => [need, ...prev])}
                onBookEscrow={handleBookEscrow}
              />
            )}

            {activeTab === 'escrow' && (
              <CheckoutEscrowView
                t={t}
                selectedListing={selectedListing}
                escrowOrders={escrowOrders}
                onOrderCreated={(order) =>
                  setEscrowOrders((prev) => [order, ...prev])
                }
                onOrderVerified={(updatedOrder, auditEntry) => {
                  setEscrowOrders((prev) =>
                    prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
                  );
                  if (auditEntry) setAuditLogs((prev) => [auditEntry, ...prev]);
                }}
              />
            )}

            {activeTab === 'security' && (
              <SecurityCenterView
                t={t}
                listings={listings}
                sellers={sellers}
                auditLogs={auditLogs}
                onNewAuditLog={(entry) => setAuditLogs((prev) => [entry, ...prev])}
              />
            )}

            {activeTab === 'metrics' && metrics && (
              <PerformanceDashboardView
                t={t}
                metrics={metrics}
                onRefreshMetrics={(m) => setMetrics(m)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quiet Editorial Footer (No fake telemetry tickers) */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 mt-12">
        <div className="max-w-[1380px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            YardStock Construction Surplus Exchange · Mumbai, Navi Mumbai & Thane Metropolitan Region · CPWD DSR Benchmarked
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className="hover:text-slate-900"
            >
              Zero-Trust & SHAP Security
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metrics')}
              className="hover:text-slate-900"
            >
              Evaluation Benchmark (n=100)
            </button>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="hover:text-slate-900"
            >
              Phone OTP Login ({authSession.user.role})
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Tab Bar (Thumb-Zone Ergonomics, <= 15% Viewport Height) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center h-14">
        {(
          [
            { id: 'marketplace', label: 'Market', icon: MapPin },
            { id: 'snap', label: 'Snap AI', icon: Camera },
            { id: 'smart-match', label: 'Match', icon: Compass },
            { id: 'escrow', label: 'Escrow', icon: Lock },
            { id: 'metrics', label: 'Metrics', icon: BarChart3 },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] ${
                active ? 'text-amber-600 font-semibold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        session={authSession}
        onAuthenticated={(s) => setAuthSession(s)}
      />

      <OfflineIndicator />
    </div>
  );
}
