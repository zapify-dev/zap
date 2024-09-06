import { Address } from 'viem';
import { arbitrum, mainnet } from 'viem/chains';

export const dataFeedAddresses: Record<number, Record<string, Address>> = {
  [mainnet.id]: {
    'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  },
  [arbitrum.id]: {
    'BTC/USD': '0x6ce185860a4963106506C203335A2910413708e9',
    'ETH/USD': '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
  },
};
