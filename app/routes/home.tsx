import React, { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";

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

// Configuration - Replace with your actual API URL and user management
export const API_URL = "https://novis-api-development.dappgenie.io";
//"https://novis-gold-api.dappgenie.io";
//export const API_URL = "http://localhost:3006";
// export const API_URL = "http://10.0.2.2:3006";
export const USER_ID = "678892771483c1763703ac5f";

// Utility function for date/time
const getFormattedDateAndTime = () => {
	const now = new Date();
	const timeOptions: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	};
	const formattedTime = now.toLocaleTimeString("en-US", timeOptions);
	return { formattedTime };
};

// SSE Hook for real-time price updates
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
	return <div className="w-24 h-7 bg-yellow-600 rounded animate-pulse"></div>;
};

// Logo Header Component
const LogoHeader: React.FC<{ showDates?: boolean }> = ({ showDates = true }) => {
	const [dateTime, setDateTime] = useState(getFormattedDateAndTime());

	useEffect(() => {
		const interval = setInterval(() => {
			setDateTime(getFormattedDateAndTime());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex items-center justify-between w-full relative mb-14">
			{showDates && (
				<div className="flex flex-col items-center">
					<div className="text-yellow-300 text-2xl mb-1">🕐</div>
					<span className="text-yellow-300 text-xs font-bold">{dateTime.formattedTime}</span>
				</div>
			)}

			<div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
				<div className="w-15 h-24 bg-yellow-300 bg-opacity-10 rounded-lg flex items-center justify-center -mt-5">
					<span className="text-yellow-300 font-bold text-xs">LOGO</span>
				</div>
			</div>

			{showDates && <div className="w-7"></div>}
		</div>
	);
};

// Price Card Component
const PriceCard: React.FC<{
	loading: boolean;
	rates: MetalRates | null;
	priceChanges: PriceChanges;
}> = ({ loading, rates, priceChanges }) => {
	return (
		<div className="space-y-4">
			{/* Gold Card */}
			<div className="bg-red-900 rounded-xl overflow-hidden">
				<div className="bg-gradient-to-r from-red-900 to-red-700 p-4">
					<div className="flex flex-col space-y-4">
						<div className="flex items-start">
							{!loading && rates?.ouncePriceUsd?.bid ? (
								<h3 className="text-red-300 font-bold text-base">GOLD OZ</h3>
							) : (
								<PriceLoader />
							)}
						</div>

						<div className="flex justify-around items-center">
							<div className="flex flex-col items-center flex-1">
								<span className="text-white font-bold text-sm mb-2">BID</span>
								<div className={`rounded-lg py-2 px-3 min-w-24 text-center ${priceChanges?.bidPriceIncreased ? 'bg-green-600' :
									priceChanges?.bidPriceDecreased ? 'bg-red-600' : 'bg-transparent'
									}`}>
									{!loading && rates ? (
										<span className={`text-yellow-300 font-semibold text-lg ${priceChanges?.bidPriceIncreased || priceChanges?.bidPriceDecreased ? 'text-white' : ''
											}`}>
											${rates?.ouncePriceUsd?.bid}
										</span>
									) : (
										<PriceLoader />
									)}
								</div>
							</div>

							<div className="flex flex-col items-center flex-1">
								<span className="text-white font-bold text-sm mb-2">ASK</span>
								<div className={`rounded-lg py-2 px-3 min-w-24 text-center ${priceChanges?.askPriceIncreased ? 'bg-green-600' :
									priceChanges?.askPriceDecreased ? 'bg-red-600' : 'bg-transparent'
									}`}>
									{!loading && rates ? (
										<span className={`text-yellow-300 font-semibold text-lg ${priceChanges?.askPriceIncreased || priceChanges?.askPriceDecreased ? 'text-white' : ''
											}`}>
											${rates?.ouncePriceUsd?.ask}
										</span>
									) : (
										<PriceLoader />
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Silver Card */}
			<div className="bg-gray-700 rounded-xl overflow-hidden">
				<div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4">
					<div className="flex flex-col space-y-4">
						<div className="flex items-start">
							{!loading && rates?.silverOuncePriceUsd?.bid ? (
								<h3 className="text-gray-300 font-bold text-base">SILVER OZ</h3>
							) : (
								<PriceLoader />
							)}
						</div>

						<div className="flex justify-around items-center">
							<div className="flex flex-col items-center flex-1">
								<span className="text-white font-bold text-sm mb-2">BID</span>
								<div className={`rounded-lg py-2 px-3 min-w-24 text-center ${priceChanges?.silverBidPriceIncreased ? 'bg-green-600' :
									priceChanges?.silverBidPriceDecreased ? 'bg-red-600' : 'bg-transparent'
									}`}>
									{!loading && rates ? (
										<span className="text-white font-semibold text-lg">
											${rates?.silverOuncePriceUsd?.bid}
										</span>
									) : (
										<PriceLoader />
									)}
								</div>
							</div>

							<div className="flex flex-col items-center flex-1">
								<span className="text-white font-bold text-sm mb-2">ASK</span>
								<div className={`rounded-lg py-2 px-3 min-w-24 text-center ${priceChanges?.silverAskPriceIncreased ? 'bg-green-600' :
									priceChanges?.silverAskPriceDecreased ? 'bg-red-600' : 'bg-transparent'
									}`}>
									{!loading && rates ? (
										<span className="text-white font-semibold text-lg">
											${rates?.silverOuncePriceUsd?.ask}
										</span>
									) : (
										<PriceLoader />
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

// Price Chart Component
const PriceChart: React.FC<{
	rates: MetalRates | null;
	loading: boolean;
	priceChanges: PriceChanges;
}> = ({ rates, loading }) => {
	const chartData = [
		{ key: "gramPrice", label: "GRAM 24K" },
		{ key: "gramNineOneSix", label: "GRAM 22K" },
		{ key: "ttbPrice", label: "TTB" },
		{ key: "nineNineFive", label: "995" },
		{ key: "tripleNinePointFive", label: "999.5" },
	];

	return (
		<div className="bg-red-800 rounded-xl p-4 mt-5 border border-gray-600">
			{/* Chart Header */}
			<div className="flex items-center py-3 border-b border-gray-600 mb-2">
				<div className="flex-1 text-center">
					<span className="text-yellow-300 font-bold text-sm">TYPE</span>
				</div>
				<div className="w-px h-full bg-gray-600 opacity-30"></div>
				<div className="flex-1 text-center">
					<span className="text-yellow-300 font-bold text-sm">BID</span>
				</div>
				<div className="w-px h-full bg-gray-600 opacity-30"></div>
				<div className="flex-1 text-center">
					<span className="text-yellow-300 font-bold text-sm">ASK</span>
				</div>
			</div>

			{/* Chart Data Rows */}
			{chartData.slice(0, 5).map((item, index) => {
				const rateData = rates?.[item.key as keyof MetalRates] as { bid: number; ask: number } | undefined;

				return (
					<div key={index} className="flex items-center py-3 border-b border-gray-700 border-opacity-50">
						<div className="flex-1 text-center">
							<span className="text-white text-sm font-medium">{item.label}</span>
						</div>
						<div className="w-px h-full bg-gray-600 opacity-30"></div>
						<div className="flex-1 text-center">
							{!loading && rateData ? (
								<span className="text-white text-sm font-semibold">
									{rateData.bid}
								</span>
							) : (
								<div className="w-16 h-5 bg-yellow-600 rounded animate-pulse mx-auto"></div>
							)}
						</div>
						<div className="w-px h-full bg-gray-600 opacity-30"></div>
						<div className="flex-1 text-center">
							{!loading && rateData ? (
								<span className="text-white text-sm font-semibold">
									{rateData.ask}
								</span>
							) : (
								<div className="w-16 h-5 bg-yellow-600 rounded animate-pulse mx-auto"></div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

// Scrolling Banner Component
const ScrollingBanner: React.FC<{
	primaryColor: string;
	secondaryColor: string;
	bannerText: string;
}> = ({ primaryColor, secondaryColor, bannerText }) => {
	return (
		<div
			className="flex items-center h-6 w-full overflow-hidden fixed bottom-0 left-0"
			style={{ backgroundColor: primaryColor }}
		>
			<div className="animate-marquee whitespace-nowrap">
				<span
					className="text-xs font-bold uppercase"
					style={{ color: secondaryColor }}
				>
					{bannerText}
				</span>
			</div>
		</div>
	);
};

export function meta({ }: Route.MetaArgs) {
	return [
		{ title: "Live Gold & Silver Prices" },
		{ name: "description", content: "Real-time gold and silver price tracking" },
	];
}

// Main Home Component
const Home: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [previousRates, setPreviousRates] = useState<MetalRates | null>(null);
	const [priceChanges, setPriceChanges] = useState<PriceChanges>({});
	const [primaryColor] = useState("#C62127");
	const [secondaryColor] = useState("#FFFFFF");

	// Use SSE hook for real-time price updates
	const { liveRates } = useSSE(API_URL, USER_ID);

	// Track price changes for animations
	useEffect(() => {
		if (liveRates && previousRates) {
			const changes: PriceChanges = {};

			// Gold price changes
			if (liveRates.ouncePriceUsd?.bid !== previousRates.ouncePriceUsd?.bid) {
				changes.bidPriceIncreased = liveRates.ouncePriceUsd?.bid > previousRates.ouncePriceUsd?.bid;
				changes.bidPriceDecreased = liveRates.ouncePriceUsd?.bid < previousRates.ouncePriceUsd?.bid;
			}

			if (liveRates.ouncePriceUsd?.ask !== previousRates.ouncePriceUsd?.ask) {
				changes.askPriceIncreased = liveRates.ouncePriceUsd?.ask > previousRates.ouncePriceUsd?.ask;
				changes.askPriceDecreased = liveRates.ouncePriceUsd?.ask < previousRates.ouncePriceUsd?.ask;
			}

			// Silver price changes
			if (liveRates.silverOuncePriceUsd?.bid !== previousRates.silverOuncePriceUsd?.bid) {
				changes.silverBidPriceIncreased = liveRates.silverOuncePriceUsd?.bid > previousRates.silverOuncePriceUsd?.bid;
				changes.silverBidPriceDecreased = liveRates.silverOuncePriceUsd?.bid < previousRates.silverOuncePriceUsd?.bid;
			}

			if (liveRates.silverOuncePriceUsd?.ask !== previousRates.silverOuncePriceUsd?.ask) {
				changes.silverAskPriceIncreased = liveRates.silverOuncePriceUsd?.ask > previousRates.silverOuncePriceUsd?.ask;
				changes.silverAskPriceDecreased = liveRates.silverOuncePriceUsd?.ask < previousRates.silverOuncePriceUsd?.ask;
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
		<div className="min-h-screen bg-red-800 text-white">
			<div className="container mx-auto px-6 py-16 pb-32">
				<LogoHeader showDates={true} />

				<div className="mb-6">
					<PriceCard
						loading={isLoading}
						rates={liveRates}
						priceChanges={priceChanges}
					/>
				</div>

				<PriceChart
					rates={liveRates}
					loading={isLoading}
					priceChanges={priceChanges}
				/>
			</div>

			<ScrollingBanner
				primaryColor={primaryColor}
				secondaryColor={secondaryColor}
				bannerText="Live Gold & Silver Prices - Real-time Updates via SSE"
			/>

			{/* Add custom CSS for marquee animation */}
			<style dangerouslySetInnerHTML={{
				__html: `
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 15s linear infinite;
          }
        `
			}} />
		</div>
	);
};

export default Home;
