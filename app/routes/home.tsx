import React, { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";

const API_URL = "https://novis-api-development.dappgenie.io";
const DEFAULT_USER_ID = "654a1b92b528e35018fe028c";

const TV_FONT =
  "'Barlow Condensed', 'Oswald', 'Arial Narrow', ui-sans-serif, system-ui, sans-serif";

const FontLoader: React.FC = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&display=swap');

      .tv-condensed {
        font-family: ${TV_FONT};
        letter-spacing: 0.04em;
      }

      .tv-price {
        font-family: ${TV_FONT};
        font-weight: 800;
        letter-spacing: 0.015em;
        font-variant-numeric: tabular-nums;
      }

      .tv-table-price {
        font-family: ${TV_FONT};
        font-weight: 700;
        letter-spacing: 0.08em;
        font-variant-numeric: tabular-nums;
      }
    `}
  </style>
);

const DASHBOARD = {
  bg: "#f6f2e8",
  panel: "#fffaf0",
  panelRow: "#ffffff",
  panelRowAlt: "#f1eadc",
  border: "#d4c5a8",
  gold: "#b98018",
  goldBright: "#d69420",
  silver: "#5b7f9d",
  silverBright: "#6f98bb",
  text: "#1c1a16",
  textMuted: "#6e665a",
  green: "#0f9f45",
  red: "#dc2638",
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
  cardGoldOzTitleColor?: string;
  cardGoldOzBgColor?: string;
  cardSilverOzBgColor?: string;
  cardSilverOzTitleColor?: string;
  goldCardGradientColor1?: string;
  goldCardGradientColor2?: string;
  silverCardGradientColor1?: string;
  silverCardGradientColor2?: string;
  goldCardBidAskLabelColor?: string;
  goldCardPriceTextColor?: string;
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

const WORLD_CLOCKS = [
  { country: "UAE", timezone: "Asia/Dubai", flagSrc: "/uae-flag.png", offset: "GST +4" },
  { country: "INDIA", timezone: "Asia/Kolkata", flagSrc: "/india-flag.png", offset: "IST +5:30" },
  { country: "UK", timezone: "Europe/London", flagSrc: "/uk-flag.png", offset: "BST +1" },
  { country: "USA", timezone: "America/New_York", flagSrc: "/us-flag.png", offset: "EDT -4" },
] as const;

const useTVFontScale = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const widthScale = window.innerWidth / 1280;
      const heightScale = window.innerHeight / 720;
      const newScale = Math.min(widthScale, heightScale);
      setScale(Math.max(1.02, Math.min(newScale * 1.05, 2)));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  return scale;
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

    localStorage.setItem("user-data", JSON.stringify(data));
    localStorage.setItem("user-id", data.id);

    if (data.tvColorScheme) {
      localStorage.setItem("tv-color-scheme", JSON.stringify(data.tvColorScheme));
    }

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

const getCompanyLogo = (): string | null => {
  const userData = getUserData();
  return userData?.logo || null;
};

const getCompanyName = (): string => {
  const userData = getUserData();
  return userData?.name || "Dfin Technologies";
};

const getTimeForTimezone = (timezone: string) => {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const useSSE = (apiUrl: string, userId: string) => {
  const [liveRates, setLiveRates] = useState<MetalRates | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!userId || !apiUrl) return;

    const sseUrl = `${apiUrl}/rates/live-rate?userId=${userId}`;

    try {
      esRef.current = new EventSource(sseUrl);

      esRef.current.addEventListener("open", () => {
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

const ShimmerLoader: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-gradient-to-r from-amber-200 to-amber-400 animate-pulse rounded ${className}`} />
);

const PriceLoader: React.FC = () => (
  <div className="w-20 h-6 bg-amber-200 rounded animate-pulse" />
);

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

  if (!showZero && (!delta || (delta.percent === 0 && delta.value === 0))) {
    return <span className="invisible text-xs">-</span>;
  }

  return (
    <div
      className="flex items-center justify-between w-full mt-3 tv-condensed"
      style={{
        color,
        fontSize: `${1.05 * fontScale}rem`,
        lineHeight: 1,
      }}
    >
      <span className="font-bold whitespace-nowrap">
        {arrow} {sign}
        {percent.toFixed(2)}%
      </span>

      <span className="font-bold whitespace-nowrap">
        {sign}
        {aed.toFixed(aed < 1 ? 3 : 2)} AED
      </span>
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
      className="tv-condensed font-bold whitespace-nowrap"
      style={{
        color,
        fontSize: `${1.15 * fontScale}rem`,
        lineHeight: 1,
      }}
    >
      {isUp ? "▲" : "▼"} {percent.toFixed(2)}%
    </span>
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
          className="w-px self-stretch opacity-80 mx-6"
          style={{ backgroundColor: dividerColor }}
        />
      )}

      <div className="flex-1 flex flex-col justify-center px-3 min-w-0">
        <span
          className="tv-condensed font-semibold uppercase"
          style={{
            color: labelColor,
            fontSize: `${1.25 * fontScale}rem`,
            lineHeight: 1,
          }}
        >
          {label}
        </span>

        {!loading && price !== undefined ? (
          <>
            <span
              className="tv-price block mt-2"
              style={{
                color: priceColor,
                fontSize: `${5.1 * fontScale}rem`,
                lineHeight: 0.9,
              }}
            >
              {price.toFixed(decimals)}
            </span>

            <PriceChangeIndicator delta={delta} fontScale={fontScale} showZero />
          </>
        ) : (
          <ShimmerLoader className="w-48 h-20 mt-4" />
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

  const bid = isGold ? rates?.ouncePriceUsd?.bid : rates?.silverOuncePriceUsd?.bid;
  const ask = isGold ? rates?.ouncePriceUsd?.ask : rates?.silverOuncePriceUsd?.ask;

  const decimals = isGold ? 2 : 3;
  const accent = isGold ? DASHBOARD.gold : DASHBOARD.silver;
  const priceColor = isGold ? DASHBOARD.goldBright : DASHBOARD.silverBright;

  return (
    <div
      className="flex-1 flex flex-col h-full border-r last:border-r-0"
      style={{
        borderColor: DASHBOARD.border,
        background:
          isGold
            ? "linear-gradient(135deg, #fff8df 0%, #fffdf7 45%, #f4e2b8 100%)"
            : "linear-gradient(135deg, #edf7ff 0%, #ffffff 45%, #dbe8f2 100%)",
      }}
    >
      <div className="flex items-center gap-4 px-10 pt-6 pb-1">
        <img
          src={isGold ? "/gold-bar.png" : "/silver-bar.png"}
          alt={isGold ? "Gold" : "Silver"}
          className="object-contain"
          style={{
            width: "clamp(2.8rem, 4.2vw, 4.4rem)",
            height: "auto",
          }}
        />

        <span
          className="tv-condensed font-extrabold uppercase"
          style={{
            color: accent,
            fontSize: `${2 * fontScale}rem`,
            lineHeight: 1,
          }}
        >
          {isGold ? "GOLD OZ" : "SILVER OZ"}
        </span>
      </div>

      <div className="flex flex-1 items-stretch px-8 pb-6">
        <SpotPriceColumn
          label="BID"
          price={bid}
          loading={loading}
          decimals={decimals}
          labelColor={DASHBOARD.textMuted}
          priceColor={priceColor}
          dividerColor={accent}
        />

        <SpotPriceColumn
          label="ASK"
          price={ask}
          loading={loading}
          decimals={decimals}
          labelColor={DASHBOARD.textMuted}
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
    style={{ borderColor: DASHBOARD.border, minHeight: "32vh" }}
  >
    <MetalSpotCard metal="gold" rates={rates} loading={loading} />
    <MetalSpotCard metal="silver" rates={rates} loading={loading} />
  </section>
);

const MarketStatusBadge: React.FC<{ isOpen: boolean; fontScale?: number }> = ({
  isOpen,
  fontScale = 1,
}) => (
  <div className="flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500" : "bg-red-500"}`} />
    <span
      className="tv-condensed font-bold tracking-widest uppercase"
      style={{
        color: isOpen ? DASHBOARD.green : DASHBOARD.red,
        fontSize: `${0.9 * fontScale}rem`,
      }}
    >
      MARKET {isOpen ? "OPEN" : "CLOSED"}
    </span>
  </div>
);

const MetalTableHeader: React.FC<{
  logoSrc: string;
  currentDate: Date;
  isMarketOpen: boolean;
}> = ({ logoSrc, currentDate, isMarketOpen }) => {
  const fontScale = useTVFontScale();
  const dateStr = currentDate
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, " ")
    .toUpperCase();

  return (
    <div
      className="flex items-center justify-between px-5 py-3 border-b shrink-0"
      style={{ borderColor: DASHBOARD.border, backgroundColor: "#fff8e8" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={logoSrc}
          alt="Company logo"
          className="h-10 w-auto object-contain shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("dfin-logo")) target.src = "/dfin-logo.png";
          }}
        />
      </div>

      <div className="flex items-center gap-8">
        <span
          className="tv-condensed font-bold uppercase"
          style={{ color: DASHBOARD.goldBright, fontSize: `${1.15 * fontScale}rem` }}
        >
          {dateStr}
        </span>

        <div className="w-px h-6 opacity-70" style={{ backgroundColor: DASHBOARD.gold }} />

        <MarketStatusBadge isOpen={isMarketOpen} fontScale={fontScale} />
      </div>

      <span
        className="tv-condensed font-medium uppercase shrink-0"
        style={{ color: DASHBOARD.textMuted, fontSize: `${0.85 * fontScale}rem` }}
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
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

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
          backgroundColor: "#f7ead0",
        }}
      >
        {["METAL", "WEIGHT", "BID (AED)", "ASK (AED)", "CHANGE"].map((header) => (
          <div
            key={header}
            className="tv-condensed font-bold uppercase"
            style={{ color: DASHBOARD.gold, fontSize: `${1 * fontScale}rem` }}
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
              key={item.key}
              className="grid gap-2 text-center items-center px-4 border-b last:border-b-0 flex-1"
              style={{
                gridTemplateColumns: "1.4fr 0.8fr 1.2fr 1.2fr 0.9fr",
                backgroundColor: rowBg,
                borderColor: DASHBOARD.border,
              }}
            >
              <div
                className="tv-condensed font-bold text-left pl-2"
                style={{ color: DASHBOARD.text, fontSize: `${1.25 * fontScale}rem` }}
              >
                {item.label}
                {item.purity && (
                  <span className="ml-2 font-bold" style={{ color: DASHBOARD.text }}>
                    {item.purity}
                  </span>
                )}
              </div>

              <div
                className="tv-condensed"
                style={{ color: DASHBOARD.textMuted, fontSize: `${1.1 * fontScale}rem` }}
              >
                {item.weight}
              </div>

              <div
                className="tv-table-price"
                style={{
                  color: DASHBOARD.goldBright,
                  fontSize: `${1.35 * fontScale}rem`,
                }}
              >
                {!loading && rateData ? formatPrice(rateData.bid) : <PriceLoader />}
              </div>

              <div
                className="tv-table-price"
                style={{
                  color: DASHBOARD.goldBright,
                  fontSize: `${1.35 * fontScale}rem`,
                }}
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
      className={`flex items-center gap-5 px-5 py-4 ${!isLast ? "border-b" : ""}`}
      style={{ borderColor: DASHBOARD.border }}
    >
      <div
        className="rounded-full overflow-hidden shrink-0 border bg-white"
        style={{
          width: "clamp(3rem, 4.4vw, 4rem)",
          height: "clamp(3rem, 4.4vw, 4rem)",
          borderColor: DASHBOARD.border,
        }}
      >
        <img src={flagSrc} alt={country} className="w-full h-full object-cover" />
      </div>

      <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
        <div className="flex flex-col min-w-0">
          <span
            className="tv-condensed font-bold uppercase"
            style={{ color: DASHBOARD.gold, fontSize: `${1.15 * fontScale}rem` }}
          >
            {country}
          </span>

          <span
            className="tv-condensed"
            style={{ color: DASHBOARD.textMuted, fontSize: `${0.8 * fontScale}rem` }}
          >
            {offset}
          </span>
        </div>

        <span
          className="tv-condensed font-bold uppercase whitespace-nowrap"
          style={{
            color: DASHBOARD.text,
            fontSize: `${1.8 * fontScale}rem`,
            lineHeight: 1,
          }}
        >
          {time}
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
      {WORLD_CLOCKS.map((clock, index) => (
        <WorldClockRow
          key={clock.country}
          {...clock}
          fontScale={fontScale}
          isLast={index === WORLD_CLOCKS.length - 1}
        />
      ))}
    </aside>
  );
};

const DashboardFooter: React.FC<{ time: string }> = ({ time }) => {
  const newsText =
    "Global markets steady as investors await key economic data this week...";

  return (
    <footer
      className="flex flex-col border-t shrink-0"
      style={{
        borderColor: DASHBOARD.border,
        backgroundColor: "#fffaf0",
        minHeight: "12vh",
      }}
    >
      <div className="flex items-center gap-4 px-6 py-3 border-b" style={{ borderColor: DASHBOARD.border }}>
        <div className="flex items-center gap-2 shrink-0" style={{ maxWidth: "38%" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={DASHBOARD.gold}
            strokeWidth="2"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>

          <span className="text-sm leading-snug" style={{ color: DASHBOARD.text }}>
            The price shown is indicative. Please contact us for booking.
          </span>
        </div>

        <div className="w-px self-stretch shrink-0 opacity-70" style={{ backgroundColor: DASHBOARD.gold }} />

        <div className="flex-1 flex items-center overflow-hidden min-w-0 gap-4">
          <span className="tv-condensed font-bold shrink-0" style={{ color: DASHBOARD.gold, fontSize: "1.25rem" }}>
            GOLD NEWS:
          </span>

          <span className="text-sm truncate" style={{ color: DASHBOARD.text }}>
            {newsText}
          </span>
        </div>

        <span
          className="tv-condensed font-bold shrink-0 uppercase"
          style={{ color: DASHBOARD.gold, fontSize: "1.25rem" }}
        >
          {time}
        </span>
      </div>

      <div className="flex items-center px-6 py-2 gap-6 overflow-hidden">
        {[
          "GOLD 4471.60 ▲ 0.14%",
          "SILVER 73.133 ▼ -0.02%",
          "DOW JONES 42,654.74 ▲ 0.15%",
          "NASDAQ 18,987.91 ▲ 0.21%",
          "S&P 500 5,980.87 ▲ 0.17%",
          "USD INDEX 104.32 ▼ -0.14%",
        ].map((item, index) => {
          const isDown = item.includes("▼");

          return (
            <div
              key={item}
              className={`tv-condensed whitespace-nowrap ${index !== 0 ? "border-l pl-6" : ""}`}
              style={{
                borderColor: DASHBOARD.border,
                color: DASHBOARD.text,
                fontSize: "1rem",
              }}
            >
              {item.split("▲")[0].split("▼")[0]}
              <span style={{ color: isDown ? DASHBOARD.red : DASHBOARD.green }}>
                {isDown ? "▼" : "▲"}
                {item.split(isDown ? "▼" : "▲")[1]}
              </span>
            </div>
          );
        })}
      </div>
    </footer>
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

  const logoSrc = isClient ? getCompanyLogo() || "/dfin-logo.png" : "/dfin-logo.png";

  return (
    <div
      className="flex flex-col h-screen w-screen relative overflow-hidden"
      style={{
        fontFamily: TV_FONT,
        backgroundColor: DASHBOARD.bg,
        color: DASHBOARD.text,
      }}
    >
      <FontLoader />

      <button
        onClick={handleLogout}
        className="absolute top-2 right-3 z-50 p-2 transition-colors cursor-pointer"
        style={{ color: DASHBOARD.textMuted }}
        title="Power Off"
        type="button"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
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
        style={{ backgroundColor: DASHBOARD.bg, color: DASHBOARD.text }}
      >
        <FontLoader />

        <div className="text-center">
          {isClient && getCompanyLogo() && (
            <img
              src={getCompanyLogo()!}
              alt={getCompanyName()}
              className="h-16 w-auto mx-auto mb-4 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          )}

          <div className="tv-condensed text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  return <AuthenticatedHome />;
};

export default Home;