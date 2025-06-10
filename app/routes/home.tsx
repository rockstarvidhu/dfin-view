
import React, { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";

// Types
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


// Types
interface MetalRates {
	gramPrice: { ask: number; bid: number; };
	gramNineOneSix: { ask: number; bid: number; };
	nineNineFive: { ask: number; bid: number; };
	ouncePriceUsd: { ask: number; bid: number; };
	tripleNinePointFive: { ask: number; bid: number; };
	ttbPrice: { ask: number; bid: number; };
	silverOuncePriceUsd: { ask: number; bid: number; };
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

interface PriceCardProps {
	rates?: MetalRates | null;
	loading?: boolean;
}

// Shimmer Loader Component
const ShimmerLoader: React.FC<{ className?: string }> = ({ className = "" }) => {
	return (
		<div className={`bg-gradient-to-r from-yellow-600 to-yellow-400 animate-pulse rounded ${className}`}></div>
	);
};

const PriceCard: React.FC<PriceCardProps> = ({
	rates = null,
	loading = false
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
		gramPrice: { ask: 75.50, bid: 75.25 },
		gramNineOneSix: { ask: 69.20, bid: 68.95 },
		nineNineFive: { ask: 74.80, bid: 74.55 },
		ouncePriceUsd: { ask: 2347.50, bid: 2345.25 },
		tripleNinePointFive: { ask: 75.10, bid: 74.85 },
		ttbPrice: { ask: 73.90, bid: 73.65 },
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
						bidPriceIncreased: newRates.ouncePriceUsd?.bid > displayedRates.ouncePriceUsd?.bid,
						bidPriceDecreased: newRates.ouncePriceUsd?.bid < displayedRates.ouncePriceUsd?.bid,
						askPriceIncreased: newRates.ouncePriceUsd?.ask > displayedRates.ouncePriceUsd?.ask,
						askPriceDecreased: newRates.ouncePriceUsd?.ask < displayedRates.ouncePriceUsd?.ask,
						silverBidPriceIncreased: newRates.silverOuncePriceUsd?.bid > displayedRates.silverOuncePriceUsd?.bid,
						silverBidPriceDecreased: newRates.silverOuncePriceUsd?.bid < displayedRates.silverOuncePriceUsd?.bid,
						silverAskPriceIncreased: newRates.silverOuncePriceUsd?.ask > displayedRates.silverOuncePriceUsd?.ask,
						silverAskPriceDecreased: newRates.silverOuncePriceUsd?.ask < displayedRates.silverOuncePriceUsd?.ask,
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
			<div className="relative bg-gradient-to-r from-red-900 to-orange-600 rounded-xl h-40 overflow-visible">
				{/* Background Image */}
				<div
					className="absolute inset-0 w-full h-full rounded-xl"
					style={{
						backgroundImage: `url('/spiral.png')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat'
					}}
				>
					{/* Overlay */}
					<div className="relative flex items-center justify-center h-full overflow-visible px-6">
						{/* Gold OZ Title */}
						<div className="absolute -top-4 bg-[#FFA62E] px-4 py-2 rounded-xl shadow-lg">
							{!loading && currentRates?.ouncePriceUsd?.bid ? (
								<span className="text-red-800 font-bold text-sm">GOLD OZ</span>
							) : (
								<ShimmerLoader className="w-20 h-6" />
							)}
						</div>

						{/* Gold Bar Image */}
						<div className="absolute left-4 top-1/2 transform -translate-y-1/2">
							<img
								src="/gold-bar.png"
								alt="Gold Bars"
								className="w-24 h-18 object-contain"
							/>
						</div>

						{/* Price Container */}
						<div className="flex w-full gap-8 mt-4 ml-20">
							{/* BID Column */}
							<div className="flex-1 flex flex-col items-center">
								{!loading && currentRates?.ouncePriceUsd?.bid ? (
									<span className="text-yellow-300 text-lg font-bold mb-3">BID</span>
								) : (
									<ShimmerLoader className="w-16 h-6 mb-3" />
								)}
								<div className={`px-3 py-2 rounded-lg min-w-[140px] text-center ${
									priceChanges?.bidPriceIncreased ? 'bg-green-600' :
									priceChanges?.bidPriceDecreased ? 'bg-red-600' : ''
								}`}>
									{!loading && currentRates ? (
										<span className={`text-2xl font-bold ${
											priceChanges?.bidPriceIncreased || priceChanges?.bidPriceDecreased
												? 'text-white'
												: 'text-yellow-300'
										}`}>
											{currentRates?.ouncePriceUsd?.bid}
										</span>
									) : (
										<ShimmerLoader className="w-32 h-8" />
									)}
								</div>
							</div>

							{/* ASK Column */}
							<div className="flex-1 flex flex-col items-center">
								{!loading && currentRates?.ouncePriceUsd?.ask ? (
									<span className="text-yellow-300 text-lg font-bold mb-3">ASK</span>
								) : (
									<ShimmerLoader className="w-16 h-6 mb-3" />
								)}
								<div className={`px-3 py-2 rounded-lg min-w-[140px] text-center ${
									priceChanges?.askPriceIncreased ? 'bg-green-600' :
									priceChanges?.askPriceDecreased ? 'bg-red-600' : ''
								}`}>
									{!loading && currentRates ? (
										<span className={`text-2xl font-bold ${
											priceChanges?.askPriceIncreased || priceChanges?.askPriceDecreased
												? 'text-white'
												: 'text-yellow-300'
										}`}>
											{currentRates?.ouncePriceUsd?.ask}
										</span>
									) : (
										<ShimmerLoader className="w-32 h-8" />
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Silver Card */}
			<div className="relative bg-gradient-to-r from-gray-400 to-gray-200 rounded-xl h-32 -mt-2 overflow-visible">
				{/* Background Image */}
				<div
					className="absolute inset-0 w-full h-full rounded-xl"
					style={{
						backgroundImage: `url('/spiral.png')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat'
					}}
				>
					{/* Overlay */}
					<div className="relative flex items-center justify-center h-full overflow-visible px-6">
						{/* Silver OZ Title */}
						<div className="absolute -top-3 bg-red-800 px-3 py-1 rounded-lg shadow-lg">
							{!loading && currentRates?.silverOuncePriceUsd?.bid ? (
								<span className="text-white font-bold text-xs">SILVER OZ</span>
							) : (
								<ShimmerLoader className="w-16 h-4" />
							)}
						</div>

						{/* Silver Bar Image */}
						<div className="absolute left-4 top-1/2 transform -translate-y-1/2">
							<img
								src="/silver-bar.png"
								alt="Silver Bars"
								className="w-20 h-15 object-contain"
							/>
						</div>

						{/* Price Container */}
						<div className="flex w-full gap-8 mt-2 ml-20">
							{/* BID Column */}
							<div className="flex-1 flex flex-col items-center">
								{!loading && currentRates?.silverOuncePriceUsd?.bid ? (
									<span className="text-gray-800 text-lg font-bold mb-2">BID</span>
								) : (
									<ShimmerLoader className="w-16 h-5 mb-2" />
								)}
								<div className={`px-2 py-1 rounded-lg min-w-[120px] text-center ${
									priceChanges?.silverBidPriceIncreased ? 'bg-green-600' :
									priceChanges?.silverBidPriceDecreased ? 'bg-red-600' : ''
								}`}>
									{!loading && currentRates ? (
										<span className={`text-xl font-bold ${
											priceChanges?.silverBidPriceIncreased || priceChanges?.silverBidPriceDecreased
												? 'text-white'
												: 'text-gray-800'
										}`}>
											{currentRates?.silverOuncePriceUsd?.bid}
										</span>
									) : (
										<ShimmerLoader className="w-24 h-6" />
									)}
								</div>
							</div>

							{/* ASK Column */}
							<div className="flex-1 flex flex-col items-center">
								{!loading && currentRates?.silverOuncePriceUsd?.ask ? (
									<span className="text-gray-800 text-lg font-bold mb-2">ASK</span>
								) : (
									<ShimmerLoader className="w-16 h-5 mb-2" />
								)}
								<div className={`px-2 py-1 rounded-lg min-w-[120px] text-center ${
									priceChanges?.silverAskPriceIncreased ? 'bg-green-600' :
									priceChanges?.silverAskPriceDecreased ? 'bg-red-600' : ''
								}`}>
									{!loading && currentRates ? (
										<span className={`text-xl font-bold ${
											priceChanges?.silverAskPriceIncreased || priceChanges?.silverAskPriceDecreased
												? 'text-white'
												: 'text-gray-800'
										}`}>
											{currentRates?.silverOuncePriceUsd?.ask}
										</span>
									) : (
										<ShimmerLoader className="w-24 h-6" />
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
	if (typeof window !== 'undefined') {
		return localStorage.getItem("user-id") !== null;
	}
	return false;
};

// Get user ID from storage or use default
const getUserId = (): string => {
	if (typeof window !== 'undefined') {
		return localStorage.getItem("user-id") || DEFAULT_USER_ID;
	}
	return DEFAULT_USER_ID;
};

// Logout function
const logout = (): void => {
	if (typeof window !== 'undefined') {
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
const CountryTimeHeader: React.FC = () => {
	const [indiaTime, setIndiaTime] = useState(getTimeForTimezone("Asia/Kolkata"));
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
		<div className="flex justify-center gap-6 mb-8">
			{/* India */}
			<div className="flex flex-col items-center">
				<div className="w-16 h-16 rounded-full overflow-hidden mb-3">
					<img
						src="/india-flag.png"
						alt="India Flag"
						className="w-full h-full object-cover"
					/>
				</div>
				<div className="bg-[#FFCB84] text-black px-3 py-2 rounded-lg font-bold text-center min-w-[90px]">
					<div className="text-xs mb-1">INDIA</div>
					<div className="text-sm">{indiaTime}</div>
				</div>
			</div>

			{/* UK */}
			<div className="flex flex-col items-center">
				<div className="w-16 h-16 rounded-full overflow-hidden mb-3">
					<img
						src="/uk-flag.png"
						alt="UK Flag"
						className="w-full h-full object-cover"
					/>
				</div>
				<div className="bg-[#FFCB84] text-black px-3 py-2 rounded-lg font-bold text-center min-w-[90px]">
					<div className="text-xs mb-1">UK</div>
					<div className="text-sm">{ukTime}</div>
				</div>
			</div>

			{/* USA */}
			<div className="flex flex-col items-center">
				<div className="w-16 h-16 rounded-full overflow-hidden mb-3">
					<img
						src="/us-flag.png"
						alt="US Flag"
						className="w-full h-full object-cover"
					/>
				</div>
				<div className="bg-[#FFCB84] text-black px-3 py-2 rounded-lg font-bold text-center min-w-[90px]">
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
		<div className="flex items-center justify-between w-full mb-8">
			{/* Left timezone */}
			<TimezoneClock {...timezones[0]} />

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

			{/* Right timezones */}
			<div className="flex space-x-4">
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
}> = ({ rates, loading }) => {
	const tableData = [
		{ key: "gramPrice", label: "GRAM", weight: "1 Kg", purity: "24K" },
		{ key: "gramNineOneSix", label: "GRAM", weight: "1 Kg", purity: "22K" },
		{ key: "ttbPrice", label: "TTB", weight: "1 Kg", purity: "" },
		{ key: "nineNineFive", label: "995", weight: "1 Kg", purity: "" },
		{ key: "tripleNinePointFive", label: "999.9", weight: "1 Kg", purity: "" },
	];

	return (
		<div className="mb-8">

			{/* Table Header */}
			<div className="bg-[#F6111C] rounded-3xl p-5 mb-2">
				<div className="grid grid-cols-4 gap-4 text-center">
					<div className="text-white font-bold text-sm">METAL</div>
					<div className="text-white font-bold text-sm">WEIGHT</div>
					<div className="text-white font-bold text-sm">BID (AED)</div>
					<div className="text-white font-bold text-sm">ASK (AED)</div>
				</div>
			</div>

			{/* Table Rows */}
			<div className="space-y-2">
				{tableData.map((item, index) => {
					const rateData = rates?.[
						item.key as keyof MetalRates
					] as { bid: number; ask: number } | undefined;

					return (
						<div
							key={index}
							className="bg-[#FFCB84] rounded-3xl p-4 text-black"
						>
							<div className="grid grid-cols-4 gap-4 text-center items-center">
								<div className="font-bold text-sm">
									{item.label}
									{item.purity && (
										<span className="text-xs ml-1">{item.purity}</span>
									)}
								</div>
								<div className="font-bold text-sm">{item.weight}</div>
								<div className="font-bold text-sm">
									{!loading && rateData ? (
										rateData.bid.toLocaleString()
									) : (
										<PriceLoader />
									)}
								</div>
								<div className="font-bold text-sm">
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
							className={`text-2xl font-bold p-3 rounded-xl ${priceChanges?.bidPriceIncreased
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
							className={`text-2xl font-bold p-3 rounded-xl ${priceChanges?.askPriceIncreased
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
							className={`text-2xl font-bold p-3 rounded-xl ${priceChanges?.silverBidPriceIncreased
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
							className={`text-2xl font-bold p-3 rounded-xl ${priceChanges?.silverAskPriceIncreased
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
			<span className="text-white text-sm">Powered by Dfin Technologies</span>
		</div>
	);
};

export function meta({ }: Route.MetaArgs) {
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
	const uaeTime = useUAETime();
	const currentDate = new Date();

	// Use SSE hook for real-time price updates
	const { liveRates } = useSSE(API_URL, getUserId());

	// Track price changes for animations
	useEffect(() => {
		if (liveRates && previousRates) {
			const changes: PriceChanges = {};

			// Gold price changes
			if (
				liveRates.ouncePriceUsd?.bid !== previousRates.ouncePriceUsd?.bid
			) {
				changes.bidPriceIncreased =
					liveRates.ouncePriceUsd?.bid > previousRates.ouncePriceUsd?.bid;
				changes.bidPriceDecreased =
					liveRates.ouncePriceUsd?.bid < previousRates.ouncePriceUsd?.bid;
			}

			if (
				liveRates.ouncePriceUsd?.ask !== previousRates.ouncePriceUsd?.ask
			) {
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




	return (
		<>
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-900 to-red-700 text-white" style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}>
			<div className="flex w-full h-[80vh]">
				<div className="flex-none w-[58%] h-full p-4">
					<div className="flex items-center justify-between w-full rounded-lg p-4 mb-4">
						{/* Left - UAE Flag and Time */}
						<div className="flex flex-col items-center">
							<div className="w-16 h-16 rounded-full overflow-hidden mb-3">
								<img
									src="/uae-flag.png"
									alt="UAE Flag"
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="bg-[#FFCB84] text-black px-3 py-2 rounded-lg font-bold text-center min-w-[90px]">
								<div className="text-xs mb-1">UAE</div>
								<div className="text-sm">{uaeTime}</div>
							</div>
						</div>

						{/* Center - Trading Image */}
						<div className="flex items-center">
							<img
								src="/dfin-logo.png"
								alt="Trading Logo"
								className="h-16 w-[200]"
							/>
							<div className="hidden text-white font-bold text-xl">TRADING</div>
						</div>

						{/* Right - Date */}
						<div className="flex flex-col items-center text-right">
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

					<DataTable
						rates={liveRates}
						loading={isLoading}
					/>





				</div>
				<div className="flex-none w-[42%] h-full  p-4">
					<CountryTimeHeader />
					<PriceCard rates={liveRates} loading={isLoading} />
				</div>
			</div>

			{/* Bottom Banner */}
			<div className="fixed bottom-4 left-4 right-4 z-50">
				<div className="bg-[#FFCB84] rounded-full px-8 w-full h-[50px] flex items-center justify-center">
					<div className="text-center">
						<span className="text-black font-bold text-l">
							Gold News: New Gold news!! New Gold news!!New Gold news!!New Gold news!!New Gold news!!New Gold news!!New Gold news!!New Go
						</span>
					</div>
				</div>
				<div className="text-center mt-2">
					<span className="text-white text-xs">Powered by Dfin Technologies</span>
				</div>
			</div>
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
					<img
						src="/dfin-logo.png"
						alt="Dfin Technologies"
						className="h-16 w-auto mx-auto mb-4"
					/>
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
