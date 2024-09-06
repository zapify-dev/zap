// src/erc20.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { erc20 } from './erc20';

describe('ERC20 functions', () => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const uniTokenAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';

  it('should return a contract instance', () => {
    const contract = erc20(uniTokenAddress, publicClient);
    expect(contract).toBeDefined();
    expect(contract.contract.address).toBe(uniTokenAddress);
  });

  it('balanceOf should return the correct balance', async () => {
    const uni = erc20(uniTokenAddress, publicClient);
    const balance = await uni.balanceOf.call('0x1a9C8182C09F50C8318d769245beA52c32BE35BC');
    console.log(balance);
    expect(balance).toBeGreaterThan(1000);
  });

  it('balancesOf should return the correct balances', async () => {
    const uni = erc20(uniTokenAddress, publicClient);
    const balances = await uni.balancesOf.call([
      '0x1a9C8182C09F50C8318d769245beA52c32BE35BC',
      '0x47173B170C64d16393a52e6C480b3Ad8c302ba1e',
    ]);
    expect(balances[0]).toBeGreaterThan(1000);
    expect(balances[1]).toBeGreaterThan(1000);

    const balances2 = await uni.balancesOf.call(
      ['0x1a9C8182C09F50C8318d769245beA52c32BE35BC', '0x47173B170C64d16393a52e6C480b3Ad8c302ba1e'],
      true,
    );
    expect(balances2[0].result).toBeGreaterThan(1000);
    expect(balances2[1].result).toBeGreaterThan(1000);
  });

  it('tokenInfo should return the correct token info (name, symbol, decimals, total supply)', async () => {
    const uni = erc20(uniTokenAddress, publicClient);
    const tokenInfo = await uni.tokenInfo.call();
    expect(tokenInfo).toStrictEqual([
      { result: 'Uniswap', status: 'success' },
      { result: 'UNI', status: 'success' },
      { result: 18, status: 'success' },
      { result: 1000000000000000000000000000n, status: 'success' },
    ]);
  });
});
