type DexScreenerResponse = {
    priceUsd: string;
    baseToken: {
      symbol: string;
    };
  };
  
  export async function getPriceOfSol(): Promise<number> {
    const address = "So11111111111111111111111111111111111111112"
    
    try {
      const response = await fetch(
        `https://api.dexscreener.com/token-pairs/v1/solana/${address}`,
        {
          headers: {
            Accept: '*/*',
          },
        }
      );
  
      if (!response.ok) {
        throw new Error('Error fetching data from Dex Screener API');
      }
  
      const data = await response.json();
  
      if (!Array.isArray(data) || !data[0]) {
        throw new Error('No data found for the given address');
      }
  
      const result: DexScreenerResponse = data[0];
      return parseFloat(result.priceUsd);
    } catch (error) {
      console.error('Error getting price:', error);
      throw error;
    }
  }
  

export const convertAmountToSol = async (usdAmount: number): Promise<number> => {
    return usdAmount / await getPriceOfSol()
}