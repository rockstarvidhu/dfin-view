import React, { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";

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
}

interface PriceChanges {
  bidPriceIncreased?: boolean;
  bidPriceDecreased?: boolean;
  askPriceIncreased?: boolean;
  askPriceDecreased?: boolean;
  silverBidPriceIncreased?: boolean;
  silverBidPriceDecreased?: boolean;
  silverAskPriceIncreased?: boolean;
  silverAskPriceDecreased?: boolean;
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
  tvColors?: TvColorScheme;
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

const PriceCard: React.FC<PriceCardProps> = ({
  rates = null,
  loading = false,
  tvColors = {},
}) => {
  const [displayedRates, setDisplayedRates] = useState<MetalRates | null>(null);
  const liveRatesRef = useRef<MetalRates | null>(null);
  const [priceChanges, setPriceChanges] = useState<PriceChanges>({
    bidPriceIncreased: false,
    bidPriceDecreased: false,
    askPriceIncreased: false,
    askPriceDecreased: false,
    silverBidPriceIncreased: false,
    silverBidPriceDecreased: false,
    silverAskPriceIncreased: false,
    silverAskPriceDecreased: false,
  });

  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dummy data for demonstration
  const dummyRates: MetalRates = {
    gramPrice: { ask: 75.5, bid: 75.25 },
    gramNineOneSix: { ask: 69.2, bid: 68.95 },
    nineNineFive: { ask: 74.8, bid: 74.55 },
    ouncePriceUsd: { ask: 2347.5, bid: 2345.25 },
    tripleNinePointFive: { ask: 75.1, bid: 74.85 },
    ttbPrice: { ask: 73.9, bid: 73.65 },
    silverOuncePriceUsd: { ask: 31.25, bid: 31.15 },
  };

  // Use dummy data if no rates provided
  const currentRates = rates || dummyRates;

  // Update the ref with the latest rates
  useEffect(() => {
    if (currentRates) {
      liveRatesRef.current = currentRates;
    }
  }, [currentRates]);

  // Throttle UI updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (liveRatesRef.current) {
        const newRates = liveRatesRef.current;

        // Compare new rates with displayed rates to detect changes
        if (displayedRates) {
          setPriceChanges({
            bidPriceIncreased:
              newRates.ouncePriceUsd?.bid > displayedRates.ouncePriceUsd?.bid,
            bidPriceDecreased:
              newRates.ouncePriceUsd?.bid < displayedRates.ouncePriceUsd?.bid,
            askPriceIncreased:
              newRates.ouncePriceUsd?.ask > displayedRates.ouncePriceUsd?.ask,
            askPriceDecreased:
              newRates.ouncePriceUsd?.ask < displayedRates.ouncePriceUsd?.ask,
            silverBidPriceIncreased:
              newRates.silverOuncePriceUsd?.bid >
              displayedRates.silverOuncePriceUsd?.bid,
            silverBidPriceDecreased:
              newRates.silverOuncePriceUsd?.bid <
              displayedRates.silverOuncePriceUsd?.bid,
            silverAskPriceIncreased:
              newRates.silverOuncePriceUsd?.ask >
              displayedRates.silverOuncePriceUsd?.ask,
            silverAskPriceDecreased:
              newRates.silverOuncePriceUsd?.ask <
              displayedRates.silverOuncePriceUsd?.ask,
          });

          // Clear any existing timeout before setting a new one
          if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
          }

          // Reset price change indicators after 6 seconds
          resetTimeoutRef.current = setTimeout(() => {
            setPriceChanges({
              bidPriceIncreased: false,
              bidPriceDecreased: false,
              askPriceIncreased: false,
              askPriceDecreased: false,
              silverBidPriceIncreased: false,
              silverBidPriceDecreased: false,
              silverAskPriceIncreased: false,
              silverAskPriceDecreased: false,
            });
          }, 6000);
        }

        // Update the displayed rates
        setDisplayedRates(newRates);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [displayedRates]);

  return (
    <div className="space-y-0">
      {/* Gold Card */}
      <div
        className="relative rounded-t-xl h-44 overflow-visible"
        style={{
          background: `linear-gradient(to right, ${
            tvColors.goldCardGradientColor1 || "#7F1D1D"
          }, ${tvColors.goldCardGradientColor2 || "#EA580C"})`,
        }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl"
          style={{
            backgroundImage: `url('/spiral.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Overlay */}
          <div className="relative flex items-center justify-center h-full overflow-visible px-8">
            {/* Gold OZ Title */}
            <div
              className="absolute -top-5 px-6 py-3 rounded-xl shadow-lg"
              style={{
                backgroundColor: tvColors.cardGoldOzBgColor || "#FFA62E",
              }}
            >
              {!loading && currentRates?.ouncePriceUsd?.bid ? (
                <span
                  className="font-bold text-lg"
                  style={{ color: tvColors.cardGoldOzTitleColor || "#C62127" }}
                >
                  GOLD OZ
                </span>
              ) : (
                <ShimmerLoader className="w-24 h-8" />
              )}
            </div>

            {/* Gold Bar Image */}
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
              <img
                src="/gold-bar.png"
                alt="Gold Bars"
                className="w-32 h-24 object-contain"
              />
            </div>

            {/* Price Container */}
            <div className="flex w-full gap-10 mt-6 ml-28">
              {/* BID Column */}
              <div className="flex-1 flex flex-col items-center">
                {!loading && currentRates?.ouncePriceUsd?.bid ? (
                  <span
                    className="text-3xl font-bold mb-4"
                    style={{
                      color: tvColors.goldCardBidAskLabelColor || "#FDE047",
                    }}
                  >
                    BID
                  </span>
                ) : (
                  <ShimmerLoader className="w-20 h-8 mb-4" />
                )}
                <div
                  className={`px-4 py-3 rounded-lg min-w-[160px] text-center ${
                    priceChanges?.bidPriceIncreased
                      ? "bg-green-600"
                      : priceChanges?.bidPriceDecreased
                      ? "bg-red-600"
                      : ""
                  }`}
                >
                  {!loading && currentRates ? (
                    <span
                      className="text-4xl font-bold"
                      style={{
                        color:
                          priceChanges?.bidPriceIncreased ||
                          priceChanges?.bidPriceDecreased
                            ? "#FFFFFF"
                            : tvColors.goldCardPriceTextColor || "#FDE047",
                      }}
                    >
                      {currentRates?.ouncePriceUsd?.bid}
                    </span>
                  ) : (
                    <ShimmerLoader className="w-36 h-10" />
                  )}
                </div>
              </div>

              {/* ASK Column */}
              <div className="flex-1 flex flex-col items-center">
                {!loading && currentRates?.ouncePriceUsd?.ask ? (
                  <span
                    className="text-3xl font-bold mb-4"
                    style={{
                      color: tvColors.goldCardBidAskLabelColor || "#FDE047",
                    }}
                  >
                    ASK
                  </span>
                ) : (
                  <ShimmerLoader className="w-20 h-8 mb-4" />
                )}
                <div
                  className={`px-4 py-3 rounded-lg min-w-[160px] text-center ${
                    priceChanges?.askPriceIncreased
                      ? "bg-green-600"
                      : priceChanges?.askPriceDecreased
                      ? "bg-red-600"
                      : ""
                  }`}
                >
                  {!loading && currentRates ? (
                    <span
                      className="text-4xl font-bold"
                      style={{
                        color:
                          priceChanges?.askPriceIncreased ||
                          priceChanges?.askPriceDecreased
                            ? "#FFFFFF"
                            : tvColors.goldCardPriceTextColor || "#FDE047",
                      }}
                    >
                      {currentRates?.ouncePriceUsd?.ask}
                    </span>
                  ) : (
                    <ShimmerLoader className="w-36 h-10" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Silver Card */}
      <div
        className="relative rounded-b-xl h-36 -mt-2 overflow-visible"
        style={{
          background: `linear-gradient(to right, ${
            tvColors.silverCardGradientColor1 || "#9CA3AF"
          }, ${tvColors.silverCardGradientColor2 || "#E5E7EB"})`,
        }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl"
          style={{
            backgroundImage: `url('/spiral.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Overlay */}
          <div className="relative flex items-center justify-center h-full overflow-visible px-8">
            {/* Silver OZ Title */}
            <div
              className="absolute -top-4 px-5 py-2 rounded-lg shadow-lg"
              style={{
                backgroundColor: tvColors.cardSilverOzBgColor || "#990C11",
              }}
            >
              {!loading && currentRates?.silverOuncePriceUsd?.bid ? (
                <span
                  className="font-bold text-base"
                  style={{
                    color: tvColors.cardSilverOzTitleColor || "#FFFFFF",
                  }}
                >
                  SILVER OZ
                </span>
              ) : (
                <ShimmerLoader className="w-20 h-6" />
              )}
            </div>

            {/* Silver Bar Image */}
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
              <img
                src="/silver-bar.png"
                alt="Silver Bars"
                className="w-28 h-20 object-contain"
              />
            </div>

            {/* Price Container */}
            <div className="flex w-full gap-10 mt-4 ml-28">
              {/* BID Column */}
              <div className="flex-1 flex flex-col items-center">
                {!loading && currentRates?.silverOuncePriceUsd?.bid ? (
                  <span
                    className="text-2xl font-bold mb-3"
                    style={{
                      color: tvColors.silverCardBidAskLabelColor || "#1F2937",
                    }}
                  >
                    BID
                  </span>
                ) : (
                  <ShimmerLoader className="w-18 h-7 mb-3" />
                )}
                <div
                  className={`px-3 py-2 rounded-lg min-w-[140px] text-center ${
                    priceChanges?.silverBidPriceIncreased
                      ? "bg-green-600"
                      : priceChanges?.silverBidPriceDecreased
                      ? "bg-red-600"
                      : ""
                  }`}
                >
                  {!loading && currentRates ? (
                    <span
                      className="text-3xl font-bold"
                      style={{
                        color:
                          priceChanges?.silverBidPriceIncreased ||
                          priceChanges?.silverBidPriceDecreased
                            ? "#FFFFFF"
                            : tvColors.silverCardPriceTextColor || "#1F2937",
                      }}
                    >
                      {currentRates?.silverOuncePriceUsd?.bid}
                    </span>
                  ) : (
                    <ShimmerLoader className="w-28 h-8" />
                  )}
                </div>
              </div>

              {/* ASK Column */}
              <div className="flex-1 flex flex-col items-center">
                {!loading && currentRates?.silverOuncePriceUsd?.ask ? (
                  <span
                    className="text-2xl font-bold mb-3"
                    style={{
                      color: tvColors.silverCardBidAskLabelColor || "#1F2937",
                    }}
                  >
                    ASK
                  </span>
                ) : (
                  <ShimmerLoader className="w-18 h-7 mb-3" />
                )}
                <div
                  className={`px-3 py-2 rounded-lg min-w-[140px] text-center ${
                    priceChanges?.silverAskPriceIncreased
                      ? "bg-green-600"
                      : priceChanges?.silverAskPriceDecreased
                      ? "bg-red-600"
                      : ""
                  }`}
                >
                  {!loading && currentRates ? (
                    <span
                      className="text-3xl font-bold"
                      style={{
                        color:
                          priceChanges?.silverAskPriceIncreased ||
                          priceChanges?.silverAskPriceDecreased
                            ? "#FFFFFF"
                            : tvColors.silverCardPriceTextColor || "#1F2937",
                      }}
                    >
                      {currentRates?.silverOuncePriceUsd?.ask}
                    </span>
                  ) : (
                    <ShimmerLoader className="w-28 h-8" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    console.log("✅ Found tvColorScheme in user data:", userData.tvColorScheme);
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
  console.log("❌ No tvColorScheme found in user data - using defaults");
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

const getFormattedDate = () => {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "short" });
  const year = now.getFullYear();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });

  return `${day} ${month} ${year}\n${weekday}`;
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

// Timezone Clock Component
const TimezoneClock: React.FC<{
  country: string;
  timezone: string;
  flag: string;
}> = ({ country, timezone, flag }) => {
  const [time, setTime] = useState(getTimeForTimezone(timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeForTimezone(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full overflow-hidden mb-2 border-2 border-yellow-400">
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-lg">
          {flag}
        </div>
      </div>
      <div className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-xs font-bold">
        {country}
      </div>
      <div className="text-yellow-300 text-xs font-bold mt-1">{time}</div>
    </div>
  );
};

// Country Time Header Component
const CountryTimeHeader: React.FC<{ tvColors?: TvColorScheme }> = ({
  tvColors = {},
}) => {
  const [indiaTime, setIndiaTime] = useState(
    getTimeForTimezone("Asia/Kolkata")
  );
  const [ukTime, setUkTime] = useState(getTimeForTimezone("Europe/London"));
  const [usTime, setUsTime] = useState(getTimeForTimezone("America/New_York"));

  useEffect(() => {
    const interval = setInterval(() => {
      setIndiaTime(getTimeForTimezone("Asia/Kolkata"));
      setUkTime(getTimeForTimezone("Europe/London"));
      setUsTime(getTimeForTimezone("America/New_York"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-between w-full">
      {/* India */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
          <img
            src="/india-flag.png"
            alt="India Flag"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="px-3 py-2 rounded-lg font-bold text-center min-w-[90px]"
          style={{
            backgroundColor: tvColors.countryBgColor || "#FFCB84",
            color: tvColors.countryTextColor || "#4D4D4D",
          }}
        >
          <div className="text-xs mb-1">INDIA</div>
          <div className="text-sm">{indiaTime}</div>
        </div>
      </div>

      {/* UK */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
          <img
            src="/uk-flag.png"
            alt="UK Flag"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="px-3 py-2 rounded-lg font-bold text-center min-w-[90px]"
          style={{
            backgroundColor: tvColors.countryBgColor || "#FFCB84",
            color: tvColors.countryTextColor || "#4D4D4D",
          }}
        >
          <div className="text-xs mb-1">UK</div>
          <div className="text-sm">{ukTime}</div>
        </div>
      </div>

      {/* USA */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
          <img
            src="/us-flag.png"
            alt="US Flag"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="px-3 py-2 rounded-lg font-bold text-center min-w-[90px]"
          style={{
            backgroundColor: tvColors.countryBgColor || "#FFCB84",
            color: tvColors.countryTextColor || "#4D4D4D",
          }}
        >
          <div className="text-xs mb-1">USA</div>
          <div className="text-sm">{usTime}</div>
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header: React.FC = () => {
  const [dateTime, setDateTime] = useState(getFormattedDate());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(getFormattedDate());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const timezones = [
    { country: "UAE", timezone: "Asia/Dubai", flag: "🇦🇪" },
    { country: "INDIA", timezone: "Asia/Kolkata", flag: "🇮🇳" },
    { country: "UK", timezone: "Europe/London", flag: "🇬🇧" },
    { country: "USA", timezone: "America/New_York", flag: "🇺🇸" },
  ];

  return (
    <div className="flex items-start justify-between w-full mb-8">
      {/* Left timezone - UAE aligned to top */}
      <div className="flex-none">
        <TimezoneClock {...timezones[0]} />
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center">
        <div className="flex items-center mb-2">
          <div className="text-white font-bold text-2xl mr-2">Dfin</div>
          <div className="text-yellow-400 text-sm">TECHNOLOGIES</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-300 text-lg font-bold whitespace-pre-line">
            {dateTime}
          </div>
        </div>
      </div>

      {/* Right timezones - evenly spaced and pushed down to align with UAE */}
      <div className="flex gap-8 flex-none mt-6">
        {timezones.slice(1).map((tz, index) => (
          <TimezoneClock key={index} {...tz} />
        ))}
      </div>
    </div>
  );
};

// Data Table Component
const DataTable: React.FC<{
  rates: MetalRates | null;
  loading: boolean;
  tvColors: TvColorScheme;
}> = ({ rates, loading, tvColors }) => {
  const tableData = [
    { key: "gramNineOneSix", label: "GRAM", weight: "1GM", purity: "22K" },
    { key: "gramPrice", label: "GRAM", weight: "1GM", purity: "24K" },
    { key: "ttbPrice", label: "TTB", weight: "1Ttb", purity: "" },
    { key: "nineNineFive", label: "995", weight: "1 Kg", purity: "" },
    { key: "tripleNinePointFive", label: "999.9", weight: "1 Kg", purity: "" },
  ];

  return (
    <div className="mb-8">
      {/* Table Header */}
      <div
        className="rounded-3xl p-4 mb-3"
        style={{
          backgroundColor: tvColors.metalTableHeaderBgColor || "#F6111C",
        }}
      >
        <div className="grid grid-cols-4 gap-4 text-center">
          <div
            className="font-bold text-lg"
            style={{ color: tvColors.metalTableHeaderTextColor || "#FFFFFF" }}
          >
            METAL
          </div>
          <div
            className="font-bold text-lg"
            style={{ color: tvColors.metalTableHeaderTextColor || "#FFFFFF" }}
          >
            WEIGHT
          </div>
          <div
            className="font-bold text-lg"
            style={{ color: tvColors.metalTableHeaderTextColor || "#FFFFFF" }}
          >
            BID (AED)
          </div>
          <div
            className="font-bold text-lg"
            style={{ color: tvColors.metalTableHeaderTextColor || "#FFFFFF" }}
          >
            ASK (AED)
          </div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-3">
        {tableData.map((item, index) => {
          const rateData = rates?.[item.key as keyof MetalRates] as
            | { bid: number; ask: number }
            | undefined;

          return (
            <div
              key={index}
              className="rounded-3xl p-4"
              style={{
                backgroundColor: tvColors.metalTableRowBgColor || "#FFCB84",
                color: tvColors.metalTableRowTextColor || "#4D4D4D",
              }}
            >
              <div className="grid grid-cols-4 gap-4 text-center items-center">
                <div className="font-bold text-lg">
                  {item.label}
                  {item.purity && (
                    <span className="text-base ml-1">{item.purity}</span>
                  )}
                </div>
                <div className="font-bold text-lg">{item.weight}</div>
                <div className="font-bold text-lg">
                  {!loading && rateData ? (
                    rateData.bid.toLocaleString()
                  ) : (
                    <PriceLoader />
                  )}
                </div>
                <div className="font-bold text-lg">
                  {!loading && rateData ? (
                    rateData.ask.toLocaleString()
                  ) : (
                    <PriceLoader />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Price Cards Component
const PriceCards: React.FC<{
  rates: MetalRates | null;
  loading: boolean;
  priceChanges: PriceChanges;
}> = ({ rates, loading, priceChanges }) => {
  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      {/* Gold Card */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <div className="w-16 h-12 bg-yellow-300 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🥇</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-yellow-400 text-black px-4 py-2 rounded-2xl inline-block">
            <span className="font-bold text-sm">GOLD OZ</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-black font-bold text-lg mb-2">BID</div>
            <div
              className={`text-2xl font-bold p-3 rounded-xl ${
                priceChanges?.bidPriceIncreased
                  ? "bg-green-500 text-white"
                  : priceChanges?.bidPriceDecreased
                  ? "bg-red-500 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {!loading && rates ? (
                rates.ouncePriceUsd?.bid.toFixed(3)
              ) : (
                <PriceLoader />
              )}
            </div>
            <div className="text-black text-xs mt-1">
              Day Low {rates?.ouncePriceUsd?.bid.toFixed(3) || "---"}
            </div>
          </div>

          <div>
            <div className="text-black font-bold text-lg mb-2">ASK</div>
            <div
              className={`text-2xl font-bold p-3 rounded-xl ${
                priceChanges?.askPriceIncreased
                  ? "bg-green-500 text-white"
                  : priceChanges?.askPriceDecreased
                  ? "bg-red-500 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {!loading && rates ? (
                rates.ouncePriceUsd?.ask.toFixed(3)
              ) : (
                <PriceLoader />
              )}
            </div>
            <div className="text-black text-xs mt-1">
              Day High {rates?.ouncePriceUsd?.ask.toFixed(3) || "---"}
            </div>
          </div>
        </div>
      </div>

      {/* Silver Card */}
      <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <div className="w-16 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🥈</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-red-600 text-white px-4 py-2 rounded-2xl inline-block">
            <span className="font-bold text-sm">SILVER OZ</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-white font-bold text-lg mb-2">BID</div>
            <div
              className={`text-2xl font-bold p-3 rounded-xl ${
                priceChanges?.silverBidPriceIncreased
                  ? "bg-green-500 text-white"
                  : priceChanges?.silverBidPriceDecreased
                  ? "bg-red-500 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {!loading && rates ? (
                rates.silverOuncePriceUsd?.bid.toFixed(3)
              ) : (
                <PriceLoader />
              )}
            </div>
            <div className="text-white text-xs mt-1">
              Day Low {rates?.silverOuncePriceUsd?.bid.toFixed(3) || "---"}
            </div>
          </div>

          <div>
            <div className="text-white font-bold text-lg mb-2">ASK</div>
            <div
              className={`text-2xl font-bold p-3 rounded-xl ${
                priceChanges?.silverAskPriceIncreased
                  ? "bg-green-500 text-white"
                  : priceChanges?.silverAskPriceDecreased
                  ? "bg-red-500 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {!loading && rates ? (
                rates.silverOuncePriceUsd?.ask.toFixed(3)
              ) : (
                <PriceLoader />
              )}
            </div>
            <div className="text-white text-xs mt-1">
              Day High {rates?.silverOuncePriceUsd?.ask.toFixed(3) || "---"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Scrolling Banner Component
const ScrollingBanner: React.FC = () => {
  return (
    <div className="bg-yellow-400 text-black py-3 fixed bottom-0 left-0 w-full overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        <span className="text-sm font-bold">
          Gold News: New Gold news!! New Gold news!!New Gold news!!New Gold
          news!!New Gold news!!New Gold news!!New Gold news!!New Go
        </span>
      </div>
    </div>
  );
};

// Footer
const Footer: React.FC = () => {
  return (
    <div className="text-center py-4 mb-16">
      <span className="text-white text-sm">
        Powered by Dfin Technologies LLC
      </span>
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
  const [previousRates, setPreviousRates] = useState<MetalRates | null>(null);
  const [priceChanges, setPriceChanges] = useState<PriceChanges>({});
  const [tvColors, setTvColors] = useState<TvColorScheme>(
    DEFAULT_TV_COLOR_SCHEME
  );
  const uaeTime = useUAETime();
  const currentDate = new Date();

  // Load TV color scheme on component mount and refresh user data
  useEffect(() => {
    const loadTvColors = () => {
      const colors = getTvColorScheme();
      console.log("Setting TV colors:", colors);
      setTvColors(colors);
    };

    const initializeData = async () => {
      // First, try to refresh user data to get latest colors
      const refreshed = await refreshUserData();
      if (refreshed) {
        console.log("User data refreshed successfully");
      } else {
        console.log("Using cached user data");
      }

      // Load TV colors (either refreshed or cached)
      loadTvColors();
    };

    initializeData();

    // Also listen for storage changes in case user data is updated
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user-data") {
        console.log("User data changed, reloading TV colors");
        loadTvColors();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Use SSE hook for real-time price updates
  const { liveRates } = useSSE(API_URL, getUserId());

  // Track price changes for animations
  useEffect(() => {
    if (liveRates && previousRates) {
      const changes: PriceChanges = {};

      // Gold price changes
      if (liveRates.ouncePriceUsd?.bid !== previousRates.ouncePriceUsd?.bid) {
        changes.bidPriceIncreased =
          liveRates.ouncePriceUsd?.bid > previousRates.ouncePriceUsd?.bid;
        changes.bidPriceDecreased =
          liveRates.ouncePriceUsd?.bid < previousRates.ouncePriceUsd?.bid;
      }

      if (liveRates.ouncePriceUsd?.ask !== previousRates.ouncePriceUsd?.ask) {
        changes.askPriceIncreased =
          liveRates.ouncePriceUsd?.ask > previousRates.ouncePriceUsd?.ask;
        changes.askPriceDecreased =
          liveRates.ouncePriceUsd?.ask < previousRates.ouncePriceUsd?.ask;
      }

      // Silver price changes
      if (
        liveRates.silverOuncePriceUsd?.bid !==
        previousRates.silverOuncePriceUsd?.bid
      ) {
        changes.silverBidPriceIncreased =
          liveRates.silverOuncePriceUsd?.bid >
          previousRates.silverOuncePriceUsd?.bid;
        changes.silverBidPriceDecreased =
          liveRates.silverOuncePriceUsd?.bid <
          previousRates.silverOuncePriceUsd?.bid;
      }

      if (
        liveRates.silverOuncePriceUsd?.ask !==
        previousRates.silverOuncePriceUsd?.ask
      ) {
        changes.silverAskPriceIncreased =
          liveRates.silverOuncePriceUsd?.ask >
          previousRates.silverOuncePriceUsd?.ask;
        changes.silverAskPriceDecreased =
          liveRates.silverOuncePriceUsd?.ask <
          previousRates.silverOuncePriceUsd?.ask;
      }

      setPriceChanges(changes);

      // Reset price change indicators after 2 seconds
      setTimeout(() => {
        setPriceChanges({});
      }, 2000);
    }

    if (liveRates) {
      setPreviousRates(liveRates);
      setIsLoading(false);
    }
  }, [liveRates]);

  // Debug log for background color
  console.log(
    "Current TV background color:",
    tvColors.backgroundColor || "#5D0004"
  );

  return (
    <>
      <div
        className="flex flex-col h-screen text-white relative overflow-hidden pt-4"
        style={{
          fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
          backgroundColor: tvColors.backgroundColor || "#5D0004",
        }}
      >
        {/* Header Section with all flags aligned */}
        <div className="flex items-start w-full px-6 pt-6 pb-4">
          {/* Left Side Container - matching price chart width exactly */}
          <div className="flex items-start justify-between w-[58%] pr-6">
            {/* UAE Flag - Start */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                <img
                  src="/uae-flag.png"
                  alt="UAE Flag"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="text-black px-3 py-2 rounded-lg font-bold text-center min-w-[90px]"
                style={{
                  backgroundColor: tvColors.countryBgColor || "#FFCB84",
                  color: tvColors.countryTextColor || "#4D4D4D",
                }}
              >
                <div className="text-xs mb-1">UAE</div>
                <div className="text-sm">{uaeTime}</div>
              </div>
            </div>

            {/* Company Logo - Middle */}
            <div className="flex items-center pt-2">
              {getCompanyLogo() && (
                <img
                  src={getCompanyLogo()!}
                  alt="Logo"
                  className="h-24"
                  onError={({ currentTarget: target }) => {
                    console.error("Failed to load company logo, hiding logo");
                    target.style.display = "none";
                  }}
                />
              )}
            </div>

            {/* Date - End */}
            <div className="flex flex-col items-end">
              <div className="text-white text-lg font-bold">
                {currentDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="text-white text-base">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
            </div>
          </div>

          {/* Right - Other Country Flags */}
          <div className="w-[42%] pl-6">
            <CountryTimeHeader tvColors={tvColors} />
          </div>

          {/* Logout Button - Hidden for now */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl absolute top-4 right-4"
            title="Logout"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <main className="flex w-full flex-1 overflow-visible">
          <div className="flex-none w-[58%] h-full p-6 overflow-visible">
            <DataTable
              rates={liveRates}
              loading={isLoading}
              tvColors={tvColors}
            />
          </div>
          <div className="flex-none w-[42%] h-full p-6 overflow-visible">
            <div className="pt-4">
              <PriceCard
                rates={liveRates}
                loading={isLoading}
                tvColors={tvColors}
              />
            </div>
          </div>
        </main>

        {/* Bottom Banner */}
        <footer className="mt-auto px-6 pb-6">
          <div
            className="rounded-full px-12 w-full h-[70px] flex items-center justify-center"
            style={{
              backgroundColor: tvColors.bottomBannerBgColor || "#FFCB84",
            }}
          >
            <div className="text-center">
              <span
                className="font-bold text-xl"
                style={{ color: tvColors.bottomBannerTextColor || "#4D4D4D" }}
              >
                Gold market’s closed today. It’ll be back online when trading resumes Monday morning.
                {/* Gold News: New Gold news!! New Gold news!!New Gold news!!New
                Gold news!!New Gold news!!New Gold news!!New Gold news!!New Go */}
              </span>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-white text-sm">
              Powered by Dfin Technologies LLC
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

// Main Home Component with Authentication Check
const Home: React.FC = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
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
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-900 to-red-700">
        <div className="text-center">
          {getCompanyLogo() && (
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
// {/* <div className="container mx-auto px-6 py-8 pb-32"> */}
// 	{/* 	<Header /> */}
// 	{/* 	<DataTable rates={liveRates} loading={isLoading} /> */}
// 	{/* 	<PriceCards */}
// 	{/* 		rates={liveRates} */}
// 	{/* 		loading={isLoading} */}
// 	{/* 		priceChanges={priceChanges} */}
// 	{/* 	/> */}
// 	{/* 	<Footer /> */}
// 	{/* </div> */}
// 	{/**/}
// 	{/* <ScrollingBanner /> */}
// 	{/**/}
// 	{/* {/* Custom CSS for animations */} */}
// 	{/* <style */}
// 	{/* 	dangerouslySetInnerHTML={{ */}
// 	{/* 		__html: ` */}
// 	{/*        @keyframes marquee { */}
// 	{/*          0% { transform: translateX(100%); } */}
// 	{/*          100% { transform: translateX(-100%); } */}
// 	{/*        } */}
// 	{/*        .animate-marquee { */}
// 	{/*          animation: marquee 20s linear infinite; */}
// 	{/*        } */}
// 	{/*      `, */}
// 	{/* 	}} */}
// 	{/* /> */}
