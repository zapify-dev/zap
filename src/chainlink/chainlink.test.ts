import { describe, expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';
import { arbitrum } from 'viem/chains';
import { chainlink } from './chainlink';
import { dataFeedAddresses } from './presets';

describe('Chainlink functions', () => {
  const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http(),
  });

  it('should return a btc price', async () => {
    const contract = chainlink(publicClient);
    const price = await contract.dataFeeds.latestRoundData.call(dataFeedAddresses[arbitrum.id]['BTC/USD']);
    expect(price[1] > 0n).toBe(true);
  });
});
