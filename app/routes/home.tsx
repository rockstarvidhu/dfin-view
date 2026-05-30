import React, { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";

export const API_URL = "https://novis-api-development.dappgenie.io";
export const DEFAULT_USER_ID = "654a1b92b528e35018fe028c";

const PRICE_FONT =
  "'Barlow Condensed', 'Arial Narrow', Manrope, ui-sans-serif, system-ui, sans-serif";

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

const FontLoader: React.FC = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&display=swap');

      .dashboard-price {
        font-family: ${PRICE_FONT};
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.025em;
      }

      .glass-dark {
        background:
          linear-gradient(135deg, rgba(10,10,10,0.38), rgba(3,3,3,0.24)),
          radial-gradient(circle at 18% 0%, rgba(255,255,255,0.10), transparent 34%);
        border: 1px solid rgba(255,255,255,0.13);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.08),
          0 16px 42px rgba(0,0,0,0.24);
        backdrop-filter: blur(5px) saturate(125%);
      }

      .glass-row {
        background: rgba(8, 8, 8, 0.34);
        border: 1px solid rgba(255,255,255,0.075);
        backdrop-filter: blur(4px) saturate(120%);
      }

      .flash-up { animation: flashUp 850ms ease-out; }
      .flash-down { animation: flashDown 850ms ease-out; }

      @keyframes flashUp {
        0% { background-color: #22E66B; box-shadow: 0 0 34px rgba(34,230,107,0.65); }
        100% { background-color: transparent; box-shadow: none; }
      }

      @keyframes flashDown {
        0% { background-color: #FF374A; box-shadow: 0 0 34px rgba(255,55,74,0.65); }
        100% { background-color: transparent; box-shadow: none; }
      }

      .showcase-frame {
        pointer-events: none;
      }

      .showcase-frame img {
        opacity: 0;
        animation: metalShowcase 16s infinite;
      }

      .showcase-frame img:nth-child(1) { animation-delay: 0s; }
      .showcase-frame img:nth-child(2) { animation-delay: 4s; }
      .showcase-frame img:nth-child(3) { animation-delay: 8s; }
      .showcase-frame img:nth-child(4) { animation-delay: 12s; }

      @keyframes metalShowcase {
        0% { opacity: 0; transform: scale(0.99); }
        6% { opacity: 1; transform: scale(1); }
        25% { opacity: 1; transform: scale(1); }
        31% { opacity: 0; transform: scale(1.01); }
        100% { opacity: 0; }
      }
    `}
  </style>
);

const DASHBOARD = {
  border: "rgba(255,255,255,0.12)",
  goldBright: "#FFC233",
  silverBright: "#B9DBF5",
  text: "#FFFFFF",
  textMuted: "#A6ADB8",
  green: "#22E66B",
  red: "#FF374A",
  date: "#D9B75F",
};

interface TvColorScheme {
  backgroundColor?: string;
  countryBgColor?: string;
  countryTextColor?: string;
  metalTableHeaderBgColor?: string;
  metalTableHeaderTextColor?: string;
  metalTableRowBgColor?: string;
  metalTableRowTextColor?: string;
  bottomBannerBgColor?: string;
  bottomBannerTextColor?: string;
}

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

interface LoginResponse {
  id: string;
  name?: string;
  logo?: string;
  tvColorScheme?: TvColorScheme;
  tvColorSchemeEnabled?: boolean;
}

const WORLD_CLOCKS = [
  { country: "UAE", timezone: "Asia/Dubai", flagSrc: ASSETS.uaeFlag, offset: "GST +4" },
  { country: "INDIA", timezone: "Asia/Kolkata", flagSrc: ASSETS.indiaFlag, offset: "IST +5:30" },
  { country: "UK", timezone: "Europe/London", flagSrc: ASSETS.londonFlag, offset: "BST +1" },
  { country: "USA", timezone: "America/New_York", flagSrc: ASSETS.usaFlag, offset: "EDT -4" },
] as const;

const DEFAULT_TV_COLOR_SCHEME: TvColorScheme = {
  backgroundColor: "#5D0004",
  countryBgColor: "#FFCB84",
  countryTextColor: "#4D4D4D",
  metalTableHeaderBgColor: "#F6111C",
  metalTableHeaderTextColor: "#FFFFFF",
  metalTableRowBgColor: "#FFCB84",
  metalTableRowTextColor: "#4D4D4D",
  bottomBannerBgColor: "#FFCB84",
  bottomBannerTextColor: "#4D4D4D",
};

const usePriceDelta = (current: number | undefined): PriceDelta | null => {
  const prevRef = useRef<number | undefined>(undefined);
  const [delta, setDelta] = useState<PriceDelta | null>(null);

  useEffect(() => {
    if (current === undefined || Number.isNaN(current)) return;
    const prev = prevRef.current;

    if (prev !== undefined && prev !== current) {
      const diff = current - prev;
      setDelta({
        value: diff,
        percent: prev !== 0 ? (diff / prev) * 100 : 0,
        direction: diff >= 0 ? "up" : "down",
      });
    }

    prevRef.current = current;
  }, [current]);

  return delta;
};

const getTodayKey = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dubai" });

const useDailyHighLow = (storageKey: string, value: number | undefined) => {
  const [range, setRange] = useState<{ high?: number; low?: number }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (value === undefined || Number.isNaN(value)) return;

    const today = getTodayKey();
    const key = `tv-range:${storageKey}`;

    setRange(() => {
      let previous: { date?: string; high?: number; low?: number } = {};

      try {
        previous = JSON.parse(localStorage.getItem(key) || "{}");
      } catch {
        previous = {};
      }

      const next =
        previous.date === today
          ? {
              date: today,
              high: previous.high === undefined ? value : Math.max(previous.high, value),
              low: previous.low === undefined ? value : Math.min(previous.low, value),
            }
          : { date: today, high: value, low: value };

      localStorage.setItem(key, JSON.stringify(next));
      return { high: next.high, low: next.low };
    });
  }, [storageKey, value]);

  return range;
};

const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("user-id") !== null;
};

const getUserId = (): string => {
  if (typeof window === "undefined") return DEFAULT_USER_ID;
  return localStorage.getItem("user-id") || DEFAULT_USER_ID;
};

const getUserData = (): LoginResponse | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user-data");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

const getCompanyCode = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("company-code");
};

const refreshUserData = async (): Promise<boolean> => {
  const companyCode = getCompanyCode();

  if (!companyCode) {
    console.log("No company code found, cannot refresh data");
    return false;
  }

  try {
    const deviceId =
      localStorage.getItem("device-id") ||
      `web-${navigator.userAgent.replace(/\s+/g, "-")}-${Date.now()}`;

    const response = await fetch(`${API_URL}/auth/mobile-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyCode, deviceId }),
    });

    if (!response.ok) {
      console.error("Failed to refresh user data:", response.status);
      return false;
    }

    const data = await response.json();
    localStorage.setItem("user-data", JSON.stringify(data));
    localStorage.setItem("user-id", data.id);
    localStorage.setItem(
      "tv-color-scheme",
      JSON.stringify(data.tvColorScheme || DEFAULT_TV_COLOR_SCHEME)
    );

    return true;
  } catch (error) {
    console.error("Error refreshing user data:", error);
    return false;
  }
};

const handleLogout = () => {
  localStorage.removeItem("user-id");
  localStorage.removeItem("user-data");
  localStorage.removeItem("tv-color-scheme");
  localStorage.removeItem("company-code");
  localStorage.removeItem("device-id");
  window.location.href = "/login";
};

const getCompanyLogo = (): string => ASSETS.fallbackLogo;

const getTimeForTimezone = (timezone: string) =>
  new Date().toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const useSSE = (apiUrl: string, userId: string) => {
  const [liveRates, setLiveRates] = useState<MetalRates | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!userId || !apiUrl) return;

    const sseUrl = `${apiUrl}/rates/live-rate?userId=${userId}`;

    try {
      esRef.current = new EventSource(sseUrl);
      esRef.current.addEventListener("open", () => setIsConnected(true));
      esRef.current.addEventListener("message", (event) => {
        try {
          setLiveRates(JSON.parse(event.data));
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      });
      esRef.current.addEventListener("error", (error) => {
        console.error("SSE Error:", error);
        setIsConnected(false);
      });
    } catch (error) {
      console.error("Failed to initialize SSE:", error);
    }

    return () => {
      esRef.current?.close();
      esRef.current = null;
      setIsConnected(false);
    };
  }, [apiUrl, userId]);

  return { liveRates, isConnected };
};

const useUAETime = () => {
  const [time, setTime] = useState(getTimeForTimezone("Asia/Dubai"));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeForTimezone("Asia/Dubai")), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
};

const PriceLoader: React.FC = () => (
  <div className="w-24 h-7 bg-gray-500/50 rounded animate-pulse" />
);

const TopBar: React.FC<{
  logoSrc: string;
  currentDate: Date;
}> = ({ logoSrc, currentDate }) => {
  const dayName = currentDate
    .toLocaleDateString("en-US", {
      timeZone: "Asia/Dubai",
      weekday: "long",
    })
    .toUpperCase();

  const dateText = currentDate
    .toLocaleDateString("en-US", {
      timeZone: "Asia/Dubai",
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <header
      className="relative grid shrink-0 items-start"
      style={{
        gridTemplateColumns: "1.28fr 1fr",
        height: "clamp(11rem, 20vh, 16rem)",
      }}
    >
      <div className="absolute left-0 top-1 flex flex-col items-center">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke={DASHBOARD.date}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        <div className="mt-1 flex flex-col items-center gap-1">
          <div
            className="font-extrabold tracking-[0.1em] whitespace-nowrap"
            style={{
              color: DASHBOARD.date,
              fontSize: "clamp(0.85rem, 1vw, 1.3rem)",
            }}
          >
            {dayName}
          </div>
          <div
            className="font-extrabold tracking-[0.12em] whitespace-nowrap"
            style={{
              color: DASHBOARD.date,
              fontSize: "clamp(0.95rem, 1.1vw, 1.45rem)",
            }}
          >
            {dateText}
          </div>
        </div>
      </div>

      <div className="flex justify-center items-start">
        <img
          src={logoSrc}
          alt="Golden Lady"
          className="object-contain"
          style={{
            width: "clamp(34rem, 42vw, 60rem)",
            height: "clamp(10.5rem, 20vh, 16rem)",
          }}
        />
      </div>

      <div className="flex justify-end items-start gap-5 pt-6">
        <MetalShowcase />

        <button
          onClick={handleLogout}
          className="text-white/55 hover:text-white p-2 transition-colors cursor-pointer"
          title="Power Off"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
};

const MetalShowcase: React.FC = () => (
  <div
    className="showcase-frame relative flex items-center justify-center overflow-visible"
    style={{
      width: "clamp(20rem, 26vw, 36rem)",
      height: "clamp(8rem, 14vh, 12rem)",
    }}
  >
    {ASSETS.showcase.map((src) => (
      <img
        key={src}
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    ))}
  </div>
);

const ClockItem: React.FC<{
  country: string;
  timezone: string;
  flagSrc: string;
  offset: string;
}> = ({ country, timezone, flagSrc, offset }) => {
  const [time, setTime] = useState(getTimeForTimezone(timezone));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeForTimezone(timezone)), 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="flex items-center justify-center gap-2 min-w-0">
      <img
        src={flagSrc}
        alt={country}
        className="shrink-0 object-contain"
        style={{ width: "clamp(1.8rem, 2.2vw, 2.65rem)", height: "auto" }}
      />

      <div className="leading-none min-w-0">
        <div
          className="font-extrabold uppercase tracking-wide"
          style={{ color: "#70E6F5", fontSize: "clamp(0.68rem, 0.74vw, 0.95rem)" }}
        >
          {country}
        </div>

        <div
          className="mt-1 font-extrabold text-white dashboard-price whitespace-nowrap"
          style={{ fontSize: "clamp(0.9rem, 0.96vw, 1.22rem)" }}
        >
          {time}
        </div>

        <div
          className="mt-1 text-white/55 uppercase"
          style={{ fontSize: "clamp(0.48rem, 0.52vw, 0.68rem)" }}
        >
          {offset}
        </div>
      </div>
    </div>
  );
};

const ClockStrip: React.FC = () => (
  <div
    className="grid grid-cols-4 items-center rounded-lg px-4 py-2 glass-dark"
    style={{ minHeight: "clamp(3.65rem, 6.4vh, 4.7rem)" }}
  >
    {WORLD_CLOCKS.map((clock) => (
      <ClockItem key={clock.country} {...clock} />
    ))}
  </div>
);

const MetalSpotCard: React.FC<{
  metal: "gold" | "silver";
  quote?: RateQuote;
  loading: boolean;
}> = ({ metal, quote, loading }) => {
  const isGold = metal === "gold";
  const decimals = isGold ? 2 : 3;
  const tracked = useDailyHighLow(`${metal}-spot`, quote?.bid);
  const bidDelta = usePriceDelta(quote?.bid);
  const askDelta = usePriceDelta(quote?.ask);

  const high = quote?.dayHigh ?? quote?.high ?? tracked.high;
  const low = quote?.dayLow ?? quote?.low ?? tracked.low;
  const accent = isGold ? DASHBOARD.goldBright : DASHBOARD.silverBright;
  const label = isGold ? "GOLD OZ" : "SILVER OZ";
  const imageSrc = isGold ? ASSETS.goldBar : ASSETS.silverBar;

  const bidFlashClass =
    bidDelta?.direction === "up"
      ? "flash-up"
      : bidDelta?.direction === "down"
        ? "flash-down"
        : "";

  const askFlashClass =
    askDelta?.direction === "up"
      ? "flash-up"
      : askDelta?.direction === "down"
        ? "flash-down"
        : "";

  const formatHighLow = (value: number | undefined) =>
    typeof value === "number" && !Number.isNaN(value) ? value.toFixed(decimals) : "--";

  return (
    <section className="glass-dark rounded-2xl px-5 py-3">
      <div className="flex items-center gap-3 mb-1.5">
        <img
          src={imageSrc}
          alt={label}
          className="object-contain shrink-0"
          style={{ width: "clamp(2rem, 2.55vw, 3.25rem)", height: "auto" }}
        />
        <div
          className="font-extrabold tracking-[0.12em]"
          style={{ color: accent, fontSize: "clamp(1.1rem, 1.18vw, 1.62rem)" }}
        >
          {label}
        </div>
      </div>

      <div className="grid items-start gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {(["BID", "ASK"] as const).map((side) => {
          const price = side === "BID" ? quote?.bid : quote?.ask;
          const flashClass = side === "BID" ? bidFlashClass : askFlashClass;
          const hlValue = side === "BID" ? high : low;
          const hlLabel = side === "BID" ? "HIGH" : "LOW";

          return (
            <div key={side} className="min-w-0 text-center">
              <div
                className="font-extrabold tracking-[0.22em]"
                style={{ color: "#ccd8ff", fontSize: "clamp(0.68rem, 0.72vw, 0.92rem)" }}
              >
                {side}
              </div>

              <div className={`mt-1 min-w-0 rounded-lg px-2 py-0.5 transition-colors ${flashClass}`}>
                {loading || price === undefined ? (
                  <PriceLoader />
                ) : (
                  <span
                    className="dashboard-price font-extrabold whitespace-nowrap"
                    style={{
                      color: accent,
                      fontSize: "clamp(2.3rem, 2.65vw, 3.55rem)",
                      lineHeight: 0.95,
                    }}
                  >
                    {price.toFixed(decimals)}
                  </span>
                )}
              </div>

              <div
                className="mt-1 font-extrabold uppercase"
                style={{
                  color: DASHBOARD.textMuted,
                  fontSize: "clamp(0.82rem, 0.9vw, 1.1rem)",
                }}
              >
                {hlLabel}{" "}
                <span 
                  className="dashboard-price"
                  style={{ color: accent, fontSize: "clamp(1rem, 1.1vw, 1.4rem)" }}
                >
                  {formatHighLow(hlValue)}
                  </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const MarketStatusBadge: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <div className="flex items-center justify-center gap-2 font-extrabold tracking-widest">
    <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? "bg-green-400" : "bg-red-500"}`} />
    <span style={{ color: isOpen ? DASHBOARD.green : DASHBOARD.red }}>
      MARKET {isOpen ? "OPEN" : "CLOSED"}
    </span>
  </div>
);

const DataTable: React.FC<{
  rates: MetalRates | null;
  loading: boolean;
}> = ({ rates, loading }) => {
  const tableData = [
    { key: "gramNineOneSix", label: "GRAM", weight: "1GM", purity: "22K" },
    { key: "gramPrice", label: "GRAM", weight: "1GM", purity: "24K" },
    { key: "ttbPrice", label: "TTB", weight: "1Ttb", purity: "" },
    { key: "nineNineFive", label: "995", weight: "1 Kg", purity: "" },
    { key: "tripleNinePointFive", label: "999.9", weight: "1 Kg", purity: "" },
  ];

  const formatPrice = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <section className="min-w-0 h-full flex flex-col">
      <div
        className="grid gap-2 text-center rounded-lg px-5 py-2.5 font-extrabold"
        style={{
          gridTemplateColumns: "1.4fr 0.8fr 1.2fr 1.2fr",
          background:
            "linear-gradient(90deg, rgba(211,168,59,0.74) 0%, rgba(248,231,138,0.68) 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(5px)",
          color: "#050505",
          fontSize: "clamp(0.9rem, 0.95vw, 1.25rem)",
        }}
      >
        {["METAL", "WEIGHT", "BID (AED)", "ASK (AED)"].map((header) => (
          <div key={header}>{header}</div>
        ))}
      </div>

      <div className="mt-2.5 flex flex-col gap-2 flex-1 min-h-0">
        {tableData.map((item) => {
          const rateData = rates?.[item.key as keyof MetalRates] as RateQuote | undefined;

          return (
            <div
              key={item.key}
              className="glass-row grid gap-2 text-center items-center rounded-lg px-5 py-2 font-extrabold flex-1"
              style={{
                gridTemplateColumns: "1.4fr 0.8fr 1.2fr 1.2fr",
                minHeight: 0,
                color: DASHBOARD.text,
                fontSize: "clamp(0.98rem, 1vw, 1.4rem)",
              }}
            >
              <div className="text-left">
                {item.label}
                {item.purity && (
                  <span className="ml-2" style={{ color: DASHBOARD.goldBright }}>
                    {item.purity}
                  </span>
                )}
              </div>

              <div style={{ color: DASHBOARD.textMuted }}>{item.weight}</div>

              <div className="dashboard-price" style={{ color: DASHBOARD.goldBright }}>
                {!loading && rateData ? formatPrice(rateData.bid) : <PriceLoader />}
              </div>

              <div className="dashboard-price" style={{ color: DASHBOARD.goldBright }}>
                {!loading && rateData ? formatPrice(rateData.ask) : <PriceLoader />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const DashboardFooter: React.FC<{ time: string }> = ({ time }) => {
  const newsText = "Global markets steady as investors await key economic data...";

  return (
    <footer
      className="flex items-center gap-4 px-6 py-1.5 border-t shrink-0"
      style={{
        borderColor: DASHBOARD.border,
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        minHeight: "4.8vh",
      }}
    >
      <div className="flex items-center gap-2 shrink-0" style={{ maxWidth: "34%" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DASHBOARD.textMuted} strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span className="text-white leading-snug" style={{ fontSize: "clamp(0.7rem, 0.78vw, 0.95rem)" }}>
          The price shown is indicative. Please contact us for booking.
        </span>
      </div>

      <div className="w-px self-stretch shrink-0 opacity-40" style={{ backgroundColor: DASHBOARD.border }} />

      <div className="flex-1 flex items-center overflow-hidden min-w-0 gap-2">
        <span
          className="font-bold shrink-0"
          style={{ color: DASHBOARD.goldBright, fontSize: "clamp(0.78rem, 0.82vw, 1rem)" }}
        >
          GOLD NEWS:
        </span>
        <span
          className="text-white truncate"
          style={{ fontSize: "clamp(0.7rem, 0.78vw, 0.95rem)" }}
        >
          {newsText}
        </span>
      </div>

      <span
        className="font-bold shrink-0 uppercase dashboard-price"
        style={{ color: DASHBOARD.goldBright, fontSize: "clamp(0.8rem, 0.9vw, 1.1rem)" }}
      >
        {time}
      </span>
    </footer>
  );
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Live Gold & Silver Prices" },
    { name: "description", content: "Real-time gold and silver price tracking" },
  ];
}

const AuthenticatedHome: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);
  const [isMarketClosed, setIsMarketClosed] = useState(false);

  const uaeTime = useUAETime();
  const { liveRates } = useSSE(API_URL, getUserId());

  useEffect(() => {
    setIsClient(true);

    const tick = () => setCurrentDate(new Date());
    tick();

    const interval = setInterval(tick, 60_000);
    refreshUserData();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (liveRates) {
      setIsMarketClosed(liveRates.isMarketClosed || false);
      setIsLoading(false);
    }
  }, [liveRates]);

  const logoSrc = isClient ? getCompanyLogo() || ASSETS.fallbackLogo : ASSETS.fallbackLogo;

  return (
    <div
      className="relative flex flex-col h-screen w-screen text-white overflow-hidden"
      style={{
        fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
        backgroundColor: "#080808",
      }}
    >
      <FontLoader />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.42), rgba(0,0,0,0.18)), url(${ASSETS.background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
          filter: "contrast(1.16) brightness(1.18) saturate(1.18)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 35% 18%, rgba(35, 160, 190, 0.12), transparent 34%), linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.22))",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1 min-h-0 px-8 pt-3 pb-3">
          <TopBar logoSrc={logoSrc} currentDate={currentDate} />

          <main
            className="grid gap-5 min-h-0"
            style={{
              gridTemplateColumns: "1.28fr 1fr",
              height: "calc(100% - clamp(11rem, 20vh, 16rem))",
              marginTop: "clamp(0.3rem, 0.8vh, 0.75rem)",
              paddingBottom: "1.25rem",
            }}
          >
            <DataTable rates={liveRates} loading={isLoading} />

            <div className="min-w-0 h-full flex flex-col gap-3">
              <ClockStrip />

              <div className="flex flex-col gap-3 min-h-0">
                <MetalSpotCard
                  metal="gold"
                  quote={liveRates?.ouncePriceUsd}
                  loading={isLoading}
                />

                <MetalSpotCard
                  metal="silver"
                  quote={liveRates?.silverOuncePriceUsd}
                  loading={isLoading}
                />

                <section className="glass-dark rounded-2xl px-6 py-3">
                  <MarketStatusBadge isOpen={!isMarketClosed} />
                </section>
              </div>
            </div>
          </main>
        </div>

        <DashboardFooter time={uaeTime} />
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkAuth = () => {
      if (!isAuthenticated()) {
        window.location.href = "/login";
        return;
      }

      setIsCheckingAuth(false);
    };

    setTimeout(checkAuth, 100);
  }, []);

  if (isCheckingAuth || !isClient) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#080808" }}
      >
        <FontLoader />
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return <AuthenticatedHome />;
};

export default Home;

