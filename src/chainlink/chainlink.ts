import { Address, erc20Abi, getContract, PublicClient, WalletClient } from 'viem';
import { AggregatorV3ABI } from '../abis/chainlink/aggregator-v3';

export function chainlink(client: PublicClient | { public: PublicClient; wallet: WalletClient }) {
  return {
    dataFeeds: {
      latestRoundData: {
        contract: (address: Address) => ({
          address,
          abi: AggregatorV3ABI,
          functionName: 'latestRoundData',
        }),
        call: async (address: Address) => {
          return await (client as PublicClient).readContract({
            address,
            abi: AggregatorV3ABI,
            functionName: 'latestRoundData',
          });
        },
      },
    },
  };
}
