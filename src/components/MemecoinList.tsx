import React, { useState, useEffect } from 'react';
import { voteOnChain } from "@/lib/filecoin-vote";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "@/components/ui/sonner";

interface Memecoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | any;
  last_updated: string;
}

const MemecoinList: React.FC = () => {
  const [memecoins, setMemecoins] = useState<Memecoin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { provider, address, isConnected, isCalibnet, hasEnoughBalance } = useWallet();
  const [isVoting, setIsVoting] = useState<{ [id: string]: boolean }>({});
  const [hasVoted, setHasVoted] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const fetchMemecoins = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=100&page=1&sparkline=false',
          {
            headers: {
              'x-cg-demo-api-key': import.meta.env.VITE_COINGECKO_API_KEY
            }
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch memecoins.');
        }
        const data: Memecoin[] = await response.json();
        setMemecoins(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchMemecoins();
  }, []);

  const handleVote = async (coinId: string, vote: "rug" | "safe") => {
    if (!isConnected || !isCalibnet || !hasEnoughBalance()) {
      toast({ title: "Connect wallet and ensure you have enough tFIL on Calibration!" });
      return;
    }
    setIsVoting((prev) => ({ ...prev, [coinId]: true }));
    try {
      const result = await voteOnChain(provider as any, coinId, vote === "safe");
      if (result.success) {
        toast({ title: "Vote submitted!", description: `Tx: ${result.txHash}` });
        setHasVoted((prev) => ({ ...prev, [coinId]: true }));
      } else {
        toast({ title: "Vote failed", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Vote error", description: String(err), variant: "destructive" });
    } finally {
      setIsVoting((prev) => ({ ...prev, [coinId]: false }));
    }
  };

  if (loading) return <p className="text-center py-8">Loading memecoins...</p>;
  if (error) return <p className="text-center py-8 text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-extrabold text-center text-gradient mb-8">
        Memecoins
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {memecoins.map((coin) => (
          <div
            key={coin.id}
            className="border rounded-xl p-6 bg-white shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <img src={coin.image} alt={coin.name} className="h-16 mb-4" />
              <h2 className="text-xl font-semibold text-center mb-2">{coin.name}</h2>
              <p className="text-sm text-gray-600">#{coin.market_cap_rank} {coin.symbol.toUpperCase()}</p>
              {/* Price Information */}
              <div className="mt-4 w-full">
                <p className="text-lg font-bold text-indigo-600">${coin.current_price?.toLocaleString()}</p>
                <div className="flex justify-between text-sm">
                  <span>24h High: ${coin.high_24h?.toLocaleString()}</span>
                  <span>24h Low: ${coin.low_24h?.toLocaleString()}</span>
                </div>
              </div>
              {/* Market Information */}
              <div className="mt-4 w-full space-y-2">
                <p className="text-sm text-gray-600">
                  Market Cap: ${coin.market_cap?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Volume: ${coin.total_volume?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Circulating Supply: {coin.circulating_supply?.toLocaleString()} {coin.symbol.toUpperCase()}
                </p>
              </div>
              {/* Price Changes */}
              <div className="mt-4 w-full">
                <p className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  24h Change: {coin.price_change_percentage_24h?.toFixed(2)}%
                  (${coin.price_change_24h?.toFixed(2)})
                </p>
              </div>
              {/* All Time Stats */}
              <div className="mt-4 w-full text-sm text-gray-600">
                <p>ATH: ${coin.ath?.toLocaleString()}</p>
                <p>ATL: ${coin.atl?.toLocaleString()}</p>
              </div>
              {/* Last Updated */}
              <p className="mt-4 text-xs text-gray-400">
                Last Updated: {new Date(coin.last_updated).toLocaleString()}
              </p>
              {/* Voting Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  className={`px-4 py-2 rounded transition-all ${
                    !isConnected 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : isVoting[coin.id] || hasVoted[coin.id]
                      ? 'bg-red-400 text-white cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  disabled={!isConnected || isVoting[coin.id] || hasVoted[coin.id]}
                  onClick={() => handleVote(coin.id, "rug")}
                >
                  {!isConnected 
                    ? "Connect Wallet" 
                    : isVoting[coin.id] 
                    ? "Voting..." 
                    : hasVoted[coin.id] 
                    ? "Voted" 
                    : "Vote RUG"
                  }
                </button>
                <button
                  className={`px-4 py-2 rounded transition-all ${
                    !isConnected 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : isVoting[coin.id] || hasVoted[coin.id]
                      ? 'bg-green-400 text-white cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  disabled={!isConnected || isVoting[coin.id] || hasVoted[coin.id]}
                  onClick={() => handleVote(coin.id, "safe")}
                >
                  {!isConnected 
                    ? "Connect Wallet" 
                    : isVoting[coin.id] 
                    ? "Voting..." 
                    : hasVoted[coin.id] 
                    ? "Voted" 
                    : "Vote SAFE"
                  }
                </button>
              </div>
              {!isConnected && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Connect your MetaMask wallet to vote on memecoins
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemecoinList; 