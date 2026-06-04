import React, { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";

export const API_URL = "https://novis-api-development.dappgenie.io";
export const DEFAULT_USER_ID = "654a1b92b528e35018fe028c";

const ASSETS = {
  background: "/background.webp",
  indiaFlag: "/flag-india.png",
  londonFlag: "/flag-london.png",
  uaeFlag: "/flag-uae.png",
  usaFlag: "/flag-usa.png",
  fallbackLogo: "/goldenlady-logo.png",
  goldBar: "/gold-bar.png",
  silverBar: "/silver-bar.png",
  showcase: ["/silver-coin.jpg", "/silver-bars.jpg", "/gold-bars.jpg", "/gold-coin.avif"],
};

// 1. Inject Inter Font Directly to Bypass Bundler Restrictions
const useGoogleFont = () => {
  useEffect(() => {
    if (!document.getElementById('inter-font')) {
      const link = document.createElement('link');
      link.id = 'inter-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);
};

const useTVFontScale = () => {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calculateScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const baseWidth = 1280;
      const baseHeight = 720;
      const widthScale = width / baseWidth;
      const heightScale = height / baseHeight;
      const newScale = Math.min(widthScale, heightScale);
      setScale(Math.max(1.02, Math.min(newScale * 1.05, 2)));
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);
  return scale;
};

const FontLoader: React.FC = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&display=swap');

      /* Fixed NASDAQ Style Animations with CSS Variables to override inline styles */
      @keyframes nasdaqBgUp {
        0%, 40% { background-color: #00FF00; }
        100% { background-color: transparent; }
      }
      @keyframes nasdaqTextUp {
        0%, 40% { color: #000000; }
        100% { color: var(--accent-color); }
      }

      @keyframes nasdaqBgDown {
        0%, 40% { background-color: #FF0000; }
        100% { background-color: transparent; }
      }
      @keyframes nasdaqTextDown {
        0%, 40% { color: #FFFFFF; }
        100% { color: var(--accent-color); }
      }

      .flash-bg-up { animation: nasdaqBgUp 800ms ease-out forwards; }
      .flash-text-up { animation: nasdaqTextUp 800ms ease-out forwards; }
      
      .flash-bg-down { animation: nasdaqBgDown 800ms ease-out forwards; }
      .flash-text-down { animation: nasdaqTextDown 800ms ease-out forwards; }

      .showcase-frame { pointer-events: none; }
      .showcase-frame img { opacity: 0; animation: metalShowcase 16s infinite; }
      .showcase-frame img:nth-child(1) { animation-delay: 0s; }
      .showcase-frame img:nth-child(2) { animation-delay: 4s; }
      .showcase-frame img:nth-child(3) { animation-delay: 8s; }
      .showcase-frame img:nth-child(4) { animation-delay: 12s; }

      @keyframes metalShowcase {
        0%   { opacity: 0; transform: scale(0.99); }
        6%   { opacity: 1; transform: scale(1); }
        25%  { opacity: 1; transform: scale(1); }
        31%  { opacity: 0; transform: scale(1.01); }
        100% { opacity: 0; }
      }

      @keyframes tickerScroll {
        0%   { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
      }
      .ticker-track-slow {
        display: inline-flex;
        white-space: nowrap;
        align-items: center;
        animation: tickerScroll 30s linear infinite;
      }
    `}
  </style>
);

const DASHBOARD = {
  goldBright: "#FFC233",
  silverBright: "#B9DBF5",
  text: "#FFFFFF",
  textMuted: "#A6ADB8",
  green: "#00FF00",
  red: "#FF0000",
  date: "#D9B75F",
};

interface RateQuote {
  ask: number;
  bid: number;
  high?: number;
  low?: number;
  dayHigh?: number;
  dayLow?: number;
}

interface MetalRates {
  gramPrice: RateQuote;
  gramNineOneSix: RateQuote;
  nineNineFive: RateQuote;
  ouncePriceUsd: RateQuote;
  tripleNinePointFive: RateQuote;
  ttbPrice: RateQuote;
  silverOuncePriceUsd: RateQuote;
  isMarketClosed?: boolean;
}

interface PriceDelta {
  value: number;
  percent: number;
  direction: "up" | "down";
}

const WORLD_CLOCKS = [
  { country: "UAE",   timezone: "Asia/Dubai",       flagSrc: ASSETS.uaeFlag,    offset: "GST +4"    },
  { country: "INDIA", timezone: "Asia/Kolkata",     flagSrc: ASSETS.indiaFlag,  offset: "IST +5:30" },
  { country: "UK",    timezone: "Europe/London",    flagSrc: ASSETS.londonFlag, offset: "BST +1"    },
  { country: "USA",   timezone: "America/New_York", flagSrc: ASSETS.usaFlag,    offset: "EDT -4"    },
] as const;

const usePriceDelta = (current: number | undefined): PriceDelta | null => {
  const prevRef = useRef<number | undefined>(undefined);
  const [delta, setDelta] = useState<PriceDelta | null>(null);

  useEffect(() => {
    if (current === undefined || Number.isNaN(current)) return;
    const prev = prevRef.current;
    if (prev !== undefined && prev !== current) {
      const diff = current - prev;
      setDelta({ value: diff, percent: prev !== 0 ? (diff / prev) * 100 : 0, direction: diff >= 0 ? "up" : "down" });
    }
    prevRef.current = current;
  }, [current]);

  return delta;
};

const getTodayKey = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dubai" });

const useDailyHighLow = (storageKey: string, value: number | undefined) => {
  const [range, setRange] = useState<{ high?: number; low?: number }>({});
  useEffect(() => {
    if (typeof window === "undefined" || value === undefined || Number.isNaN(value)) return;
    const today = getTodayKey();
    const key = `tv-range:${storageKey}`;
    setRange(() => {
      let previous: { date?: string; high?: number; low?: number } = {};
      try { previous = JSON.parse(localStorage.getItem(key) || "{}"); } catch { previous = {}; }
      const next = previous.date === today
        ? { date: today, high: previous.high === undefined ? value : Math.max(previous.high, value), low: previous.low === undefined ? value : Math.min(previous.low, value) }
        : { date: today, high: value, low: value };
      localStorage.setItem(key, JSON.stringify(next));
      return { high: next.high, low: next.low };
    });
  }, [storageKey, value]);
  return range;
};

const isAuthenticated = (): boolean => typeof window !== "undefined" && localStorage.getItem("user-id") !== null;
const getUserId = (): string => typeof window !== "undefined" ? localStorage.getItem("user-id") || DEFAULT_USER_ID : DEFAULT_USER_ID;
const getCompanyLogo = (): string => ASSETS.fallbackLogo;
const handleLogout = () => {
  localStorage.removeItem("user-id");
  localStorage.removeItem("user-data");
  window.location.href = "/login";
};

const getTimeForTimezone = (timezone: string) => new Date().toLocaleTimeString("en-US", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: true });

const useSSE = (apiUrl: string, userId: string) => {
  const [liveRates, setLiveRates] = useState<MetalRates | null>(null);
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    if (!userId || !apiUrl) return;
    try {
      esRef.current = new EventSource(`${apiUrl}/rates/live-rate?userId=${userId}`);
      esRef.current.addEventListener("message", (event) => { try { setLiveRates(JSON.parse(event.data)); } catch {} });
    } catch {}
    return () => { esRef.current?.close(); esRef.current = null; };
  }, [apiUrl, userId]);
  return { liveRates };
};

const useUAETime = () => {
  const [time, setTime] = useState(getTimeForTimezone("Asia/Dubai"));
  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeForTimezone("Asia/Dubai")), 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
};

// Data Table Setup
const DataTable: React.FC<{ rates: MetalRates | null; loading: boolean }> = ({ rates, loading }) => {
  const fontScale = useTVFontScale();
  const tableData = [
    { key: "gramNineOneSix",      label: "GOLD GRAM", weight: "1GM",  purity: "22K" },
    { key: "gramPrice",           label: "GOLD GRAM", weight: "1GM",  purity: "24K" },
    { key: "ttbPrice",            label: "GOLD TTB",  weight: "1Ttb", purity: ""    },
    { key: "nineNineFive",        label: "GOLD 995",  weight: "1 Kg", purity: ""    },
    { key: "tripleNinePointFive", label: "GOLD 999.9",weight: "1 Kg", purity: ""    },
  ];
  
  const formatPrice = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="w-full flex flex-col justify-end gap-[1.5vh]">
      <div
        className="rounded-xl flex items-center px-[2vw] border border-white/10"
        style={{
          backgroundColor: "rgba(211,168,59,0.9)",
          background: "linear-gradient(90deg, #D3A83B 0%, #F8E78A 100%)",
          height: "7vh",
        }}
      >
        {/* Adjusted column widths to give PRICES maximum breathing room to prevent ellipses */}
        <div className="grid grid-cols-[1.3fr_0.7fr_1.8fr_1.8fr] gap-[1vw] w-full">
          <div className="font-extrabold text-[#050505]" style={{ fontSize: `${0.9 * fontScale}rem` }}>METAL</div>
          <div className="font-extrabold text-[#050505] text-center" style={{ fontSize: `${0.9 * fontScale}rem` }}>WEIGHT</div>
          <div className="font-extrabold text-[#050505] text-right" style={{ fontSize: `${0.9 * fontScale}rem` }}>BID (AED)</div>
          <div className="font-extrabold text-[#050505] text-right" style={{ fontSize: `${0.9 * fontScale}rem` }}>ASK (AED)</div>
        </div>
      </div>

      {tableData.map((item, index) => {
        const rateData = rates?.[item.key as keyof MetalRates] as RateQuote | undefined;
        return (
          <div
            key={index}
            className="rounded-xl flex items-center px-[2vw] border border-white/5"
            style={{ backgroundColor: "rgba(10, 14, 20, 0.95)", height: "9vh" }}
          >
            <div className="grid grid-cols-[1.3fr_0.7fr_1.8fr_1.8fr] gap-[1vw] items-center w-full">
              {/* Reduced font sizes to prevent container blowouts */}
              <div className="font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontSize: `${1.0 * fontScale}rem` }}>
                {item.label}
                {item.purity && <span className="ml-[0.5vw]" style={{ color: DASHBOARD.goldBright, fontSize: `${0.9 * fontScale}rem` }}>{item.purity}</span>}
              </div>
              <div className="font-bold text-center" style={{ color: DASHBOARD.textMuted, fontSize: `${0.9 * fontScale}rem` }}>
                {item.weight}
              </div>
              <div 
                className="font-extrabold text-right whitespace-nowrap overflow-hidden text-ellipsis" 
                style={{ color: DASHBOARD.goldBright, fontSize: `${1.6 * fontScale}rem`, fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum" 1', letterSpacing: "-0.02em" }}
              >
                {!loading && rateData ? formatPrice(rateData.bid) : <div className="h-[3vh] w-[6vw] ml-auto bg-gray-600/50 animate-pulse rounded" />}
              </div>
              <div 
                className="font-extrabold text-right whitespace-nowrap overflow-hidden text-ellipsis" 
                style={{ color: DASHBOARD.goldBright, fontSize: `${1.6 * fontScale}rem`, fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum" 1', letterSpacing: "-0.02em" }}
              >
                {!loading && rateData ? formatPrice(rateData.ask) : <div className="h-[3vh] w-[6vw] ml-auto bg-gray-600/50 animate-pulse rounded" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Metal Spot Card Setup
const MetalSpotCard: React.FC<{ metal: "gold" | "silver"; quote?: RateQuote; loading: boolean }> = ({ metal, quote, loading }) => {
  const fontScale     = useTVFontScale();
  const isGold        = metal === "gold";
  const decimals      = isGold ? 2 : 3;
  const tracked       = useDailyHighLow(`${metal}-spot`, quote?.bid);
  const bidDelta      = usePriceDelta(quote?.bid);
  const askDelta      = usePriceDelta(quote?.ask);
  const high          = quote?.dayHigh ?? quote?.high ?? tracked.high;
  const low           = quote?.dayLow  ?? quote?.low  ?? tracked.low;
  
  const accent        = isGold ? "#FFC233" : "#B9DBF5";
  const label         = isGold ? "GOLD OZ" : "SILVER OZ";
  const imageSrc      = isGold ? ASSETS.goldBar : ASSETS.silverBar;
  const gradientBar   = isGold ? "bg-gradient-to-r from-[#8a6520] via-[#FFD700] to-[#8a6520]" : "bg-gradient-to-r from-[#6b7280] via-[#e5e7eb] to-[#6b7280]";

  const formatHighLow = (v: number | undefined) => typeof v === "number" && !Number.isNaN(v) ? v.toFixed(decimals) : "--";

  return (
    <section className="bg-[#0a0e14] border border-white/5 rounded-2xl p-[1.5vw] flex flex-col justify-center relative shadow-2xl w-full" style={{ height: "23vh", borderLeft: `4px solid ${accent}` }}>
      <div className={`absolute top-0 left-0 right-0 h-[0.4vh] rounded-tr-2xl ${gradientBar}`} />

      <div className="flex items-center gap-[1vw] mb-[0.5vh]">
        <img src={imageSrc} alt={label} className="object-contain w-[2.5vw]" />
        {/* Reduced Label size */}
        <div className="font-extrabold tracking-[0.1em]" style={{ color: accent, fontSize: `${1.1 * fontScale}rem` }}>{label}</div>
      </div>

      <div className="flex w-full mt-[0.5vh]">
        {(["BID", "ASK"] as const).map((side) => {
          const price      = side === "BID" ? quote?.bid : quote?.ask;
          const delta      = side === "BID" ? bidDelta : askDelta;
          const bgClass    = delta?.direction === "up" ? "flash-bg-up" : delta?.direction === "down" ? "flash-bg-down" : "";
          const textClass  = delta?.direction === "up" ? "flash-text-up" : delta?.direction === "down" ? "flash-text-down" : "";
          const hlValue    = side === "BID" ? high : low;
          const hlLabel    = side === "BID" ? "HIGH" : "LOW";
          
          return (
            <div key={side} className="flex flex-col items-center w-[50%] min-w-0">
              <div className="font-extrabold tracking-[0.2em] text-[#ccd8ff]" style={{ fontSize: `${0.8 * fontScale}rem` }}>{side}</div>
              
              <div className={`mt-[0.5vh] w-[90%] h-[7.5vh] rounded-xl flex items-center justify-center transition-colors ${bgClass}`}>
                {loading || price === undefined ? <div className="h-[4vh] w-[60%] bg-gray-600/50 animate-pulse rounded" /> : (
                  // Reduced main price scale to safely fit Inter numbers without ellipses
                  <span 
                    className={`font-extrabold leading-none whitespace-nowrap overflow-hidden text-ellipsis ${textClass}`} 
                    style={{ 
                      '--accent-color': accent, 
                      color: "var(--accent-color)", 
                      fontSize: `${2.5 * fontScale}rem`,
                      fontFamily: "'Inter', sans-serif", 
                      fontVariantNumeric: "tabular-nums", 
                      fontFeatureSettings: '"tnum" 1', 
                      letterSpacing: "-0.02em" 
                    } as React.CSSProperties}
                  >
                    {price.toFixed(decimals)}
                  </span>
                )}
              </div>

              <div className="mt-[1vh] font-extrabold uppercase" style={{ color: DASHBOARD.textMuted, fontSize: `${0.7 * fontScale}rem` }}>
                {hlLabel}{" "}
                <span style={{ color: accent, fontSize: `${0.9 * fontScale}rem`, fontFamily: "'Inter', sans-serif", fontFeatureSettings: '"tnum" 1' }}>{formatHighLow(hlValue)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const AuthenticatedHome: React.FC = () => {
  useGoogleFont(); // Triggers the direct head injection of the Inter font
  
  const fontScale                           = useTVFontScale();
  const [isLoading, setIsLoading]           = useState(true);
  const [currentDate, setCurrentDate]       = useState<Date>(new Date());
  const [isClient, setIsClient]             = useState(false);
  const [isMarketClosed, setIsMarketClosed] = useState(false);

  const uaeTime       = useUAETime();
  const { liveRates } = useSSE(API_URL, getUserId());

  useEffect(() => {
    setIsClient(true);
    const tick = () => setCurrentDate(new Date());
    tick();
    const interval = setInterval(tick, 60_000);
    const timeout = setTimeout(() => setIsLoading(false), 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (liveRates) { setIsMarketClosed(liveRates.isMarketClosed || false); setIsLoading(false); }
  }, [liveRates]);

  const logoSrc = isClient ? getCompanyLogo() || ASSETS.fallbackLogo : ASSETS.fallbackLogo;

  return (
    <div className="flex flex-col w-screen h-screen px-[2vw] py-[3vh] text-white overflow-hidden bg-[#080808] box-border" style={{ fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif" }}>
      <FontLoader />

      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${ASSETS.background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }} />

      <div className="relative z-10 flex flex-col w-full h-full justify-between">
        
        {/* HEADER */}
        <header className="flex w-full justify-between items-center" style={{ height: "18vh" }}>
          
          <div className="w-[58%] h-full flex items-center pr-[2vw]">
            <div className="flex flex-col items-center justify-center border-r border-white/20 pr-[1.5vw] shrink-0 h-full">
              <svg className="w-[2.5vw] h-[2.5vw] mb-[0.5vh]" viewBox="0 0 24 24" fill="none" stroke={DASHBOARD.date} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div className="font-extrabold uppercase leading-none mb-[0.3vh]" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: DASHBOARD.date, fontSize: `${1.1 * fontScale}rem` }}>
                {currentDate.toLocaleDateString("en-US", { timeZone: "Asia/Dubai", weekday: "long" })}
              </div>
              <div className="font-extrabold uppercase leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: DASHBOARD.date, fontSize: `${1.4 * fontScale}rem` }}>
                {currentDate.toLocaleDateString("en-US", { timeZone: "Asia/Dubai", month: "short", day: "2-digit", year: "numeric" })}
              </div>
            </div>

            <div className="flex-1 h-full flex items-center justify-center pl-[1vw]">
              <img src={logoSrc} alt="Company Logo" className="h-full max-h-[16vh] w-[80%] object-contain" />
            </div>
          </div>

          {/* SHOWCASE CARD: Removed Padding & BG color to fix the black box issue */}
          <div className="w-[40%] h-full relative rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            {ASSETS.showcase.map((src, i) => (
              <img key={src} src={src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-0" style={{ animation: `metalShowcase 16s infinite ${i * 4}s` }} />
            ))}
            
            <button onClick={handleLogout} className="absolute top-[1vw] right-[1vw] text-white/40 hover:text-white p-[0.5vw] transition-colors z-50 cursor-pointer">
              <svg className="w-[2vw] h-[2vw]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex w-full justify-between mt-[2vh]" style={{ height: "64vh" }}>
          
          <div className="w-[58%] h-full flex flex-col justify-end pb-[2vh]">
            <DataTable rates={liveRates} loading={isLoading} />
          </div>

          <div className="w-[40%] h-full flex flex-col justify-between">
            
            <div className="w-full flex justify-between items-center bg-[#0c121c] border border-white/10 rounded-2xl px-[2vw] shadow-xl" style={{ height: "9vh" }}>
              {WORLD_CLOCKS.map((clock) => (
                <div key={clock.country} className="flex items-center gap-[0.5vw]">
                  <img src={clock.flagSrc} alt={clock.country} className="object-contain w-[1.8vw]" />
                  <div className="leading-none">
                    <div className="font-extrabold uppercase text-[#70E6F5]" style={{ fontSize: `${0.6 * fontScale}rem` }}>{clock.country}</div>
                    <div className="mt-1 font-extrabold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: `${0.9 * fontScale}rem` }}>
                      <ClockTime timezone={clock.timezone} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <MetalSpotCard metal="gold" quote={liveRates?.ouncePriceUsd} loading={isLoading} />
            <MetalSpotCard metal="silver" quote={liveRates?.silverOuncePriceUsd} loading={isLoading} />
            
            <div className="bg-[#0c121c] border border-white/10 rounded-2xl flex items-center overflow-hidden w-full" style={{ height: "6vh" }}>
              <div className="ticker-track-slow font-extrabold tracking-widest flex items-center h-full" style={{ color: !isMarketClosed ? DASHBOARD.green : DASHBOARD.red, fontSize: `${0.9 * fontScale}rem`, lineHeight: 1 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="pr-[4vw] flex items-center">
                    <span style={{ display: "inline-block", width: "0.6vw", height: "0.6vw", borderRadius: "50%", background: !isMarketClosed ? DASHBOARD.green : DASHBOARD.red, marginRight: "0.8vw" }} />
                    MARKET {!isMarketClosed ? "OPEN" : "CLOSED"}&nbsp;&nbsp;◆
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="mt-[2vh] flex items-center px-[2vw] border-t border-white/10 bg-[#000000]/80 rounded-2xl w-full shadow-2xl shrink-0" style={{ height: "8vh" }}>
          <div className="flex items-center gap-[1vw] shrink-0">
            <svg className="w-[1.2vw] h-[1.2vw]" viewBox="0 0 24 24" fill="none" stroke={DASHBOARD.textMuted} strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className="text-white/80" style={{ fontSize: `${0.8 * fontScale}rem` }}>Prices are indicative.</span>
          </div>

          <div className="w-px h-[4vh] bg-white/20 mx-[2vw] shrink-0" />

          <div className="flex-1 overflow-hidden flex items-center gap-[1vw]">
            <span className="font-bold shrink-0" style={{ color: DASHBOARD.goldBright, fontSize: `${0.9 * fontScale}rem` }}>GOLD NEWS:</span>
            <div className="overflow-hidden flex-1" style={{ maskImage: "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)" }}>
              <div className="ticker-track-slow text-white flex items-center h-full" style={{ fontSize: `${0.9 * fontScale}rem`, lineHeight: 1 }}>
                <span>Global markets steady as investors await key economic data... ◆ Silver demand rises on industrial sector growth... ◆ UAE gold market sees strong trading volumes... ◆ Central banks continue gold reserve accumulation... &nbsp;&nbsp;&nbsp;</span>
              </div>
            </div>
          </div>

          <div className="w-px h-[4vh] bg-white/20 mx-[2vw] shrink-0" />

          <span className="font-extrabold uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: DASHBOARD.goldBright, fontSize: `${1.1 * fontScale}rem` }}>
            {uaeTime}
          </span>
        </footer>

      </div>
    </div>
  );
};

const ClockTime: React.FC<{ timezone: string }> = ({ timezone }) => {
  const [time, setTime] = useState(getTimeForTimezone(timezone));
  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeForTimezone(timezone)), 1000);
    return () => clearInterval(interval);
  }, [timezone]);
  return <>{time}</>;
};

const Home: React.FC = () => {
  const fontScale = useTVFontScale();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isClient, setIsClient]             = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkAuth = () => {
      if (!isAuthenticated()) { window.location.href = "/login"; return; }
      setIsCheckingAuth(false);
    };
    setTimeout(checkAuth, 100);
  }, []);

  if (isCheckingAuth || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <FontLoader />
        <div className="text-white font-bold" style={{ fontSize: `${2 * fontScale}rem` }}>Loading Dashboard...</div>
      </div>
    );
  }

  return <AuthenticatedHome />;
};

export default Home;
