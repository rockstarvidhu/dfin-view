import React, { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";

// TV Font Scaling Hook
const useTVFontScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Base scale for standard browser size (1280x720 for smaller reference)
      const baseWidth = 1280;
      const baseHeight = 720;
      
      // Calculate scale based on screen size
      const widthScale = width / baseWidth;
      const heightScale = height / baseHeight;
      
      // Use the smaller scale to ensure content fits, but make it more aggressive
      const newScale = Math.min(widthScale, heightScale);
      
      // Apply very minimal scaling 
      setScale(Math.max(1.02, Math.min(newScale * 1.05, 2)));
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  return scale;
};

// Types
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
  cardGoldOzTitleColor?: string;
  cardGoldOzBgColor?: string;
  cardSilverOzBgColor?: string;
  cardSilverOzTitleColor?: string;
  // Gold Card Gradient Colors
  goldCardGradientColor1?: string;
  goldCardGradientColor2?: string;
  // Silver Card Gradient Colors
  silverCardGradientColor1?: string;
  silverCardGradientColor2?: string;
  // Gold Card Text Colors
  goldCardBidAskLabelColor?: string;
  goldCardPriceTextColor?: string;
  // Silver Card Text Colors
  silverCardBidAskLabelColor?: string;
  silverCardPriceTextColor?: string;
}

interface MetalRates {
  gramPrice: { ask: number; bid: number };
  gramNineOneSix: { ask: number; bid: number };
  nineNineFive: { ask: number; bid: number };
  ouncePriceUsd: { ask: number; bid: number };
  tripleNinePointFive: { ask: number; bid: number };
  ttbPrice: { ask: number; bid: number };
  silverOuncePriceUsd: { ask: number; bid: number };
  isMarketClosed?: boolean;
}

interface PriceDelta {
  value: number;
  percent: number;
  direction: "up" | "down";
}

// Dark dashboard theme (matches TV mockup)
const DASHBOARD = {
  bg: "#080808",
  panel: "#111111",
  panelRow: "#141414",
  panelRowAlt: "#101010",
  border: "#2a2a2a",
  gold: "#D4A84B",
  goldBright: "#E8C872",
  silver: "#8EB4D4",
  silverBright: "#A8C8E0",
  text: "#FFFFFF",
  textMuted: "#8B8B8B",
  green: "#22C55E",
  red: "#EF4444",
};

const WORLD_CLOCKS = [
  { country: "UAE", timezone: "Asia/Dubai", flagSrc: "/uae-flag.png", offset: "GST +4" },
  { country: "INDIA", timezone: "Asia/Kolkata", flagSrc: "/india-flag.png", offset: "IST +5:30" },
  { country: "UK", timezone: "Europe/London", flagSrc: "/uk-flag.png", offset: "BST +1" },
  { country: "USA", timezone: "America/New_York", flagSrc: "/us-flag.png", offset: "EDT -4" },
] as const;

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

const PriceChangeIndicator: React.FC<{
  delta: PriceDelta | null;
  fontScale?: number;
  showZero?: boolean;
}> = ({ delta, fontScale = 1, showZero = false }) => {
  const isUp = !delta || delta.direction === "up";
  const color = isUp ? DASHBOARD.green : DASHBOARD.red;
  const percent = delta ? Math.abs(delta.percent) : 0;
  const aed = delta ? Math.abs(delta.value) : 0;
  const sign = isUp ? "+" : "-";
  const arrow = isUp ? "▲" : "▼";
  const fs = `${0.75 * fontScale}rem`;

  if (!showZero && (!delta || (delta.percent === 0 && delta.value === 0))) {
    return <span className="invisible text-xs">-</span>;
  }

  return (
    <div className="flex flex-col items-center gap-0.5 mt-1" style={{ color, fontSize: fs }}>
      <span className="font-semibold whitespace-nowrap">
        {arrow} {sign}
        {percent.toFixed(2)}%
      </span>
      {delta && aed > 0 && (
        <span className="font-semibold whitespace-nowrap">
          {sign}
          {aed.toFixed(aed < 1 ? 3 : 2)} AED
        </span>
      )}
    </div>
  );
};

const TableChangeCell: React.FC<{
  bid: number | undefined;
  fontScale: number;
}> = ({ bid, fontScale }) => {
  const delta = usePriceDelta(bid);
  const isUp = !delta || delta.direction === "up";
  const color = isUp ? DASHBOARD.green : DASHBOARD.red;
  const percent = delta ? Math.abs(delta.percent) : 0;

  return (
    <span
      className="font-semibold whitespace-nowrap"
      style={{ color, fontSize: `${1 * fontScale}rem` }}
    >
      {isUp ? "▲" : "▼"} {percent.toFixed(2)}%
    </span>
  );
};

interface LoginResponse {
  id: string;
  name?: string;
  logo?: string;
  tvColorScheme?: TvColorScheme;
  tvColorSchemeEnabled?: boolean;
}

interface PriceCardProps {
  rates?: MetalRates | null;
  loading?: boolean;
}

// Shimmer Loader Component
const ShimmerLoader: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`bg-gradient-to-r from-yellow-600 to-yellow-400 animate-pulse rounded ${className}`}
    ></div>
  );
};

const SpotPriceColumn: React.FC<{
  label: string;
  price: number | undefined;
  loading: boolean;
  decimals: number;
  labelColor: string;
  priceColor: string;
  dividerColor: string;
  showDivider?: boolean;
}> = ({
  label,
  price,
  loading,
  decimals,
  labelColor,
  priceColor,
  dividerColor,
  showDivider = false,
}) => {
  const fontScale = useTVFontScale();
  const delta = usePriceDelta(price);

  return (
    <>
      {showDivider && (
        <div
          className="w-px self-stretch opacity-60"
          style={{ backgroundColor: dividerColor }}
        />
      )}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <span
          className="font-bold mb-2 tracking-widest"
          style={{ color: labelColor, fontSize: `${0.95 * fontScale}rem` }}
        >
          {label}
        </span>
        {!loading && price !== undefined ? (
          <>
            <span
              className="font-extrabold dashboard-price"
              style={{
                color: priceColor,
                fontSize: `${2.4 * fontScale}rem`,
                lineHeight: 1,
              }}
            >
              {price.toFixed(decimals)}
            </span>
            <PriceChangeIndicator delta={delta} fontScale={fontScale} showZero />
          </>
        ) : (
          <ShimmerLoader className="w-32 h-12 mt-1" />
        )}
      </div>
    </>
  );
};

const MetalSpotCard: React.FC<{
  metal: "gold" | "silver";
  rates: MetalRates | null;
  loading: boolean;
}> = ({ metal, rates, loading }) => {
  const fontScale = useTVFontScale();
  const isGold = metal === "gold";
  const bid = isGold
    ? rates?.ouncePriceUsd?.bid
    : rates?.silverOuncePriceUsd?.bid;
  const ask = isGold
    ? rates?.ouncePriceUsd?.ask
    : rates?.silverOuncePriceUsd?.ask;
  const decimals = isGold ? 2 : 3;
  const accent = isGold ? DASHBOARD.gold : DASHBOARD.silver;
  const priceColor = isGold ? DASHBOARD.goldBright : DASHBOARD.silverBright;
  const labelColor = isGold ? DASHBOARD.gold : DASHBOARD.silver;

  return (
    <div
      className="flex-1 flex flex-col h-full border-r last:border-r-0"
      style={{
        borderColor: DASHBOARD.border,
        background: "linear-gradient(180deg, #121212 0%, #0a0a0a 100%)",
      }}
    >
      <div
        className="flex items-center gap-3 px-6 py-3 border-b"
        style={{ borderColor: DASHBOARD.border }}
      >
        <img
          src={isGold ? "/gold-bar.png" : "/silver-bar.png"}
          alt={isGold ? "Gold" : "Silver"}
          className="object-contain"
          style={{ width: "clamp(2.5rem, 5vw, 4rem)", height: "auto" }}
        />
        <span
          className="font-bold tracking-widest"
          style={{ color: accent, fontSize: `${1.15 * fontScale}rem` }}
        >
          {isGold ? "GOLD OZ" : "SILVER OZ"}
        </span>
      </div>
      <div className="flex flex-1 items-stretch px-4">
        <SpotPriceColumn
          label="BID"
          price={bid}
          loading={loading}
          decimals={decimals}
          labelColor={labelColor}
          priceColor={priceColor}
          dividerColor={accent}
        />
        <SpotPriceColumn
          label="ASK"
          price={ask}
          loading={loading}
          decimals={decimals}
          labelColor={labelColor}
          priceColor={priceColor}
          dividerColor={accent}
          showDivider
        />
      </div>
    </div>
  );
};

const SpotPricesRow: React.FC<PriceCardProps> = ({ rates = null, loading = false }) => (
  <section
    className="flex w-full shrink-0 border-b"
    style={{ borderColor: DASHBOARD.border, minHeight: "26vh" }}
  >
    <MetalSpotCard metal="gold" rates={rates} loading={loading} />
    <MetalSpotCard metal="silver" rates={rates} loading={loading} />
  </section>
);


// Configuration
export const API_URL = "https://novis-api-development.dappgenie.io";
export const DEFAULT_USER_ID = "654a1b92b528e35018fe028c";

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("user-id") !== null;
  }
  return false;
};

// Get user ID from storage or use default
const getUserId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("user-id") || DEFAULT_USER_ID;
  }
  return DEFAULT_USER_ID;
};

// Get user data from storage
const getUserData = (): LoginResponse | null => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("user-data");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
  }
  return null;
};

// Get company code from storage
const getCompanyCode = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("company-code");
  }
  return null;
};

// Refresh user data by calling mobile login API
const refreshUserData = async (): Promise<boolean> => {
  const companyCode = getCompanyCode();
  if (!companyCode) {
    console.log("No company code found, cannot refresh data");
    return false;
  }

  try {
    console.log("Refreshing user data for company code:", companyCode);
    const deviceId =
      localStorage.getItem("device-id") ||
      `web-${navigator.userAgent.replace(/\s+/g, "-")}-${Date.now()}`;

    const response = await fetch(`${API_URL}/auth/mobile-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyCode,
        deviceId,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh user data:", response.status);
      return false;
    }

    const data = await response.json();
    console.log("Refreshed user data:", data);

    // Update stored user data
    localStorage.setItem("user-data", JSON.stringify(data));
    localStorage.setItem("user-id", data.id);

    // Store TV color scheme
    const tvColorScheme = data.tvColorScheme || DEFAULT_TV_COLOR_SCHEME;
    localStorage.setItem("tv-color-scheme", JSON.stringify(tvColorScheme));

    return true;
  } catch (error) {
    console.error("Error refreshing user data:", error);
    return false;
  }
};

// Logout function
const handleLogout = () => {
  console.log("Logging out...");

  // Clear all stored data
  localStorage.removeItem("user-id");
  localStorage.removeItem("user-data");
  localStorage.removeItem("tv-color-scheme");
  localStorage.removeItem("company-code");
  localStorage.removeItem("device-id");

  // Redirect to login page
  window.location.href = "/login";
};

// Get company logo from user data or return null if none exists
const getCompanyLogo = (): string | null => {
  const userData = getUserData();
  if (userData?.logo) {
    console.log(
      "Using company logo:",
      userData.logo,
      "for company:",
      userData.name
    );
    return userData.logo;
  }
  console.log("No company logo found - not displaying any logo");
  return null;
};

// Get company name from user data or use default
const getCompanyName = (): string => {
  const userData = getUserData();
  return userData?.name || "Dfin Technologies";
};

// Default TV Color Scheme
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
  cardGoldOzTitleColor: "#C62127",
  cardGoldOzBgColor: "#FFA62E",
  cardSilverOzBgColor: "#990C11",
  cardSilverOzTitleColor: "#FFFFFF",
  // Gold Card Gradient Colors (from-red-900 to-orange-600)
  goldCardGradientColor1: "#7F1D1D", // red-900
  goldCardGradientColor2: "#EA580C", // orange-600
  // Silver Card Gradient Colors (from-gray-400 to-gray-200)
  silverCardGradientColor1: "#9CA3AF", // gray-400
  silverCardGradientColor2: "#E5E7EB", // gray-200
  // Gold Card Text Colors
  goldCardBidAskLabelColor: "#FDE047", // yellow-300
  goldCardPriceTextColor: "#FDE047", // yellow-300
  // Silver Card Text Colors
  silverCardBidAskLabelColor: "#1F2937", // gray-800
  silverCardPriceTextColor: "#1F2937", // gray-800
};

// Get TV color scheme from user data or use default
const getTvColorScheme = (): TvColorScheme => {
  const userData = getUserData();
  console.log("=== TV COLOR DEBUG ===");
  console.log("Full user data:", userData);
  console.log(
    "User data keys:",
    userData ? Object.keys(userData) : "No user data"
  );

  if (userData?.tvColorScheme) {
    console.log("âœ… Found tvColorScheme in user data:", userData.tvColorScheme);
    console.log(
      "Background color from API:",
      userData.tvColorScheme.backgroundColor
    );

    // The API returns tvColorScheme field, not extendedColors
    const userColors: TvColorScheme = {
      backgroundColor: userData.tvColorScheme.backgroundColor,
      countryBgColor: userData.tvColorScheme.countryBgColor,
      countryTextColor: userData.tvColorScheme.countryTextColor,
      metalTableHeaderBgColor: userData.tvColorScheme.metalTableHeaderBgColor,
      metalTableHeaderTextColor:
        userData.tvColorScheme.metalTableHeaderTextColor,
      metalTableRowBgColor: userData.tvColorScheme.metalTableRowBgColor,
      metalTableRowTextColor: userData.tvColorScheme.metalTableRowTextColor,
      bottomBannerBgColor: userData.tvColorScheme.bottomBannerBgColor,
      bottomBannerTextColor: userData.tvColorScheme.bottomBannerTextColor,
      cardGoldOzTitleColor: userData.tvColorScheme.cardGoldOzTitleColor,
      cardGoldOzBgColor: userData.tvColorScheme.cardGoldOzBgColor,
      cardSilverOzBgColor: userData.tvColorScheme.cardSilverOzBgColor,
      cardSilverOzTitleColor: userData.tvColorScheme.cardSilverOzTitleColor,
      // New gradient and text colors
      goldCardGradientColor1: userData.tvColorScheme.goldCardGradientColor1,
      goldCardGradientColor2: userData.tvColorScheme.goldCardGradientColor2,
      silverCardGradientColor1: userData.tvColorScheme.silverCardGradientColor1,
      silverCardGradientColor2: userData.tvColorScheme.silverCardGradientColor2,
      goldCardBidAskLabelColor: userData.tvColorScheme.goldCardBidAskLabelColor,
      goldCardPriceTextColor: userData.tvColorScheme.goldCardPriceTextColor,
      silverCardBidAskLabelColor:
        userData.tvColorScheme.silverCardBidAskLabelColor,
      silverCardPriceTextColor: userData.tvColorScheme.silverCardPriceTextColor,
    };

    const finalColors = { ...DEFAULT_TV_COLOR_SCHEME, ...userColors };
    console.log("Final merged colors:", finalColors);
    console.log("Final background color:", finalColors.backgroundColor);
    return finalColors;
  }
  console.log("âŒ No tvColorScheme found in user data - using defaults");
  return DEFAULT_TV_COLOR_SCHEME;
};

// Logout function
const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user-id");
    localStorage.removeItem("user-data");
    window.location.href = "/login";
  }
};

// Utility functions
const getTimeForTimezone = (timezone: string) => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// SSE Hook
const useSSE = (apiUrl: string, userId: string) => {
  const [liveRates, setLiveRates] = useState<MetalRates | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!userId || !apiUrl) return;

    const sseUrl = `${apiUrl}/rates/live-rate?userId=${userId}`;

    const initializeSSE = () => {
      try {
        esRef.current = new EventSource(sseUrl);

        esRef.current.addEventListener("open", () => {
          console.log("SSE connection opened");
          setIsConnected(true);
        });

        esRef.current.addEventListener("message", (event) => {
          try {
            const currentRate = JSON.parse(event.data);
            setLiveRates(currentRate);
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
    };

    initializeSSE();

    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setIsConnected(false);
    };
  }, [apiUrl, userId]);

  return { liveRates, isConnected };
};

// Loading Component
const PriceLoader: React.FC = () => {
  return <div className="w-20 h-6 bg-gray-400 rounded animate-pulse"></div>;
};

const MarketStatusBadge: React.FC<{ isOpen: boolean; fontScale?: number }> = ({
  isOpen,
  fontScale = 1,
}) => (
  <div className="flex items-center gap-2">
    <span
      className={`w-2 h-2 rounded-full ${isOpen ? "market-dot-open bg-green-500" : "bg-red-500"}`}
    />
    <span
      className="font-bold tracking-widest uppercase"
      style={{ color: isOpen ? DASHBOARD.green : DASHBOARD.red, fontSize: `${0.7 * fontScale}rem` }}
    >
      MARKET {isOpen ? "OPEN" : "CLOSED"}
    </span>
  </div>
);

const DashboardFooter: React.FC<{ time: string }> = ({ time }) => {
  const newsText =
    "Global markets steady as investors await key economic data this week...";
  return (
    <footer
      className="flex items-center gap-4 px-6 py-3 border-t shrink-0"
      style={{
        borderColor: DASHBOARD.border,
        backgroundColor: DASHBOARD.bg,
        minHeight: "7vh",
      }}
    >
      <div className="flex items-center gap-2 shrink-0" style={{ maxWidth: "38%" }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={DASHBOARD.textMuted}
          strokeWidth="2"
          className="shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span className="text-white text-sm leading-snug">
          The price shown is indicative. Please contact us for booking.
        </span>
      </div>
      <div
        className="w-px self-stretch shrink-0 opacity-40"
        style={{ backgroundColor: DASHBOARD.border }}
      />
      <div className="flex-1 flex items-center overflow-hidden min-w-0 gap-2">
        <span className="font-bold shrink-0" style={{ color: DASHBOARD.gold }}>
          GOLD NEWS:
        </span>
        <span className="text-white text-sm truncate">{newsText}</span>
      </div>
      <span
        className="font-bold shrink-0 uppercase"
        style={{ color: DASHBOARD.gold, fontSize: "1rem" }}
      >
        {time}
      </span>
    </footer>
  );
};

const WorldClockRow: React.FC<{
  country: string;
  timezone: string;
  flagSrc: string;
  offset: string;
  fontScale: number;
  isLast?: boolean;
}> = ({ country, timezone, flagSrc, offset, fontScale, isLast }) => {
  const [time, setTime] = useState(getTimeForTimezone(timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeForTimezone(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 ${!isLast ? "border-b" : ""}`}
      style={{ borderColor: DASHBOARD.border }}
    >
      <div
        className="rounded-full overflow-hidden shrink-0 border"
        style={{ width: "clamp(2.5rem, 4vw, 3.5rem)", height: "clamp(2.5rem, 4vw, 3.5rem)", borderColor: "#333" }}
      >
        <img src={flagSrc} alt={country} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className="font-bold uppercase tracking-wide"
          style={{ color: DASHBOARD.gold, fontSize: `${0.75 * fontScale}rem` }}
        >
          {country}
        </span>
        <span
          className="font-bold uppercase"
          style={{ color: DASHBOARD.text, fontSize: `${1.35 * fontScale}rem`, lineHeight: 1.2 }}
        >
          {time}
        </span>
        <span style={{ color: DASHBOARD.textMuted, fontSize: `${0.65 * fontScale}rem` }}>
          {offset}
        </span>
      </div>
    </div>
  );
};

const WorldClocksPanel: React.FC = () => {
  const fontScale = useTVFontScale();
  return (
    <aside
      className="h-full flex flex-col border rounded-lg overflow-hidden shrink-0"
      style={{
        width: "28%",
        borderColor: DASHBOARD.border,
        backgroundColor: DASHBOARD.panel,
      }}
    >
      {WORLD_CLOCKS.map((clock, i) => (
        <WorldClockRow
          key={clock.country}
          {...clock}
          fontScale={fontScale}
          isLast={i === WORLD_CLOCKS.length - 1}
        />
      ))}
    </aside>
  );
};

const MetalTableHeader: React.FC<{
  logoSrc: string;
  currentDate: Date;
  isMarketOpen: boolean;
}> = ({ logoSrc, currentDate, isMarketOpen }) => {
  const fontScale = useTVFontScale();
  const dateStr = currentDate
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, " ")
    .toUpperCase();

  return (
    <div
      className="flex items-center justify-between px-5 py-3 border-b shrink-0"
      style={{ borderColor: DASHBOARD.border, backgroundColor: "#0d0d0d" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={logoSrc}
          alt="Company logo"
          className="h-10 w-auto object-contain shrink-0"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            if (!t.src.includes("dfin-logo")) t.src = "/dfin-logo.png";
          }}
        />
        <span
          className="font-bold uppercase tracking-wide hidden sm:inline"
          style={{ color: DASHBOARD.text, fontSize: `${0.85 * fontScale}rem` }}
        >
          TECHNOLOGIES
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span
          className="font-bold uppercase tracking-wide"
          style={{ color: DASHBOARD.gold, fontSize: `${0.95 * fontScale}rem` }}
        >
          {dateStr}
        </span>
        <div
          className="w-px h-6 opacity-40"
          style={{ backgroundColor: DASHBOARD.gold }}
        />
        <MarketStatusBadge isOpen={isMarketOpen} fontScale={fontScale} />
      </div>
      <span
        className="font-medium uppercase tracking-wide shrink-0"
        style={{ color: DASHBOARD.textMuted, fontSize: `${0.65 * fontScale}rem` }}
      >
        PRICES IN AED
      </span>
    </div>
  );
};

const DataTable: React.FC<{
  rates: MetalRates | null;
  loading: boolean;
  logoSrc: string;
  currentDate: Date;
  isMarketOpen: boolean;
}> = ({ rates, loading, logoSrc, currentDate, isMarketOpen }) => {
  const fontScale = useTVFontScale();
  const tableData = [
    { key: "gramNineOneSix", label: "GRAM", weight: "1GM", purity: "22K" },
    { key: "gramPrice", label: "GRAM", weight: "1GM", purity: "24K" },
    { key: "ttbPrice", label: "TTB", weight: "1Ttb", purity: "" },
    { key: "nineNineFive", label: "995", weight: "1 Kg", purity: "" },
    { key: "tripleNinePointFive", label: "999.9", weight: "1 Kg", purity: "" },
  ];

  const formatPrice = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      className="h-full flex flex-col flex-1 min-w-0 border rounded-lg overflow-hidden"
      style={{ backgroundColor: DASHBOARD.panel, borderColor: DASHBOARD.border }}
    >
      <MetalTableHeader
        logoSrc={logoSrc}
        currentDate={currentDate}
        isMarketOpen={isMarketOpen}
      />
      <div
        className="grid gap-2 text-center w-full px-4 py-2 border-b shrink-0"
        style={{
          gridTemplateColumns: "1.4fr 0.8fr 1.2fr 1.2fr 0.9fr",
          borderColor: DASHBOARD.border,
        }}
      >
        {["METAL", "WEIGHT", "BID (AED)", "ASK (AED)", "CHANGE"].map((header) => (
          <div
            key={header}
            className="font-bold uppercase tracking-wide"
            style={{ color: DASHBOARD.gold, fontSize: `${0.85 * fontScale}rem` }}
          >
            {header}
          </div>
        ))}
      </div>
      <div className="flex flex-col flex-1">
        {tableData.map((item, index) => {
          const rateData = rates?.[item.key as keyof MetalRates] as
            | { bid: number; ask: number }
            | undefined;
          const rowBg = index % 2 === 0 ? DASHBOARD.panelRow : DASHBOARD.panelRowAlt;

          return (
            <div
              key={index}
              className="grid gap-2 text-center items-center px-4 border-b last:border-b-0 flex-1"
              style={{
                gridTemplateColumns: "1.4fr 0.8fr 1.2fr 1.2fr 0.9fr",
                backgroundColor: rowBg,
                borderColor: DASHBOARD.border,
              }}
            >
              <div
                className="font-bold text-left pl-2"
                style={{ color: DASHBOARD.text, fontSize: `${1 * fontScale}rem` }}
              >
                {item.label}
                {item.purity && (
                  <span className="ml-2 font-bold" style={{ color: DASHBOARD.gold }}>
                    {item.purity}
                  </span>
                )}
              </div>
              <div style={{ color: DASHBOARD.textMuted, fontSize: `${0.95 * fontScale}rem` }}>
                {item.weight}
              </div>
              <div
                className="font-bold dashboard-price"
                style={{ color: DASHBOARD.gold, fontSize: `${1.05 * fontScale}rem` }}
              >
                {!loading && rateData ? formatPrice(rateData.bid) : <PriceLoader />}
              </div>
              <div
                className="font-bold dashboard-price"
                style={{ color: DASHBOARD.gold, fontSize: `${1.05 * fontScale}rem` }}
              >
                {!loading && rateData ? formatPrice(rateData.ask) : <PriceLoader />}
              </div>
              <div>
                {!loading && rateData ? (
                  <TableChangeCell bid={rateData.bid} fontScale={fontScale} />
                ) : (
                  <PriceLoader />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Live Gold & Silver Prices" },
    {
      name: "description",
      content: "Real-time gold and silver price tracking",
    },
  ];
}

// UAE Time Hook
const useUAETime = () => {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Dubai",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Dubai",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return time;
};



// Authentication wrapper component
const AuthenticatedHome: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const uaeTime = useUAETime();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);
  const [isMarketClosed, setIsMarketClosed] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const tick = () => setCurrentDate(new Date());
    tick();
    const interval = setInterval(tick, 60_000);
    refreshUserData();
    return () => clearInterval(interval);
  }, []);

  const { liveRates } = useSSE(API_URL, getUserId());

  useEffect(() => {
    if (liveRates) {
      setIsMarketClosed(liveRates.isMarketClosed || false);
      setIsLoading(false);
    }
  }, [liveRates]);

  const logoSrc = isClient ? getCompanyLogo() || "/dfin-logo.png" : "/dfin-logo.png";

  return (
    <div
      className="flex flex-col h-screen w-screen text-white relative overflow-hidden"
      style={{
        fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
        backgroundColor: DASHBOARD.bg,
      }}
    >
      <button
        onClick={handleLogout}
        className="absolute top-2 right-3 z-50 text-white/50 hover:text-white p-2 transition-colors cursor-pointer"
        title="Power Off"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          <line x1="12" y1="2" x2="12" y2="12" />
        </svg>
      </button>

      <SpotPricesRow rates={liveRates} loading={isLoading} />

      <main className="flex flex-1 w-full overflow-hidden min-h-0 px-4 py-3 gap-4">
        <DataTable
          rates={liveRates}
          loading={isLoading}
          logoSrc={logoSrc}
          currentDate={currentDate}
          isMarketOpen={!isMarketClosed}
        />
        <WorldClocksPanel />
      </main>

      <DashboardFooter time={uaeTime} />
    </div>
  );
};

// Main Home Component with Authentication Check
const Home: React.FC = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    setIsClient(true);
    const checkAuth = () => {
      if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        window.location.href = "/login";
        return;
      }
      setIsCheckingAuth(false);
    };

    // Small delay to ensure localStorage is available
    setTimeout(checkAuth, 100);
  }, []);

  // Show loading screen while checking authentication
  if (isCheckingAuth || !isClient) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: DASHBOARD.bg }}
      >
        <div className="text-center">
          {/* Only show logo on client side to avoid hydration mismatch */}
          {isClient && getCompanyLogo() && (
            <img
              src={getCompanyLogo()!}
              alt={getCompanyName()}
              className="h-16 w-auto mx-auto mb-4 object-contain"
              onError={(e) => {
                // Hide logo if it fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          )}
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Render the authenticated home component
  return <AuthenticatedHome />;
};

export default Home;

