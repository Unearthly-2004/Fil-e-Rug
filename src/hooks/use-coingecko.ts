import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

const COINGECKO_API_KEY = 'CG-cnpoM77QkVBu7cXmobwg7VWE';

export interface Memecoin {
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
  roi: any;
  last_updated: string;
}

export const useCoinGecko = () => {
  const [memecoins, setMemecoins] = useState<Memecoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemecoins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=100&page=1&sparkline=false',
        {
          headers: {
            'X-CG-API-KEY': COINGECKO_API_KEY
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMemecoins(data);
    } catch (err) {
      console.error('Error fetching memecoins:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch memecoin data';
      setError(errorMessage);
      toast({
        title: "API Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemecoins();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchMemecoins, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const refetch = () => {
    fetchMemecoins();
  };

  return {
    memecoins,
    isLoading,
    error,
    refetch
  };
}; 