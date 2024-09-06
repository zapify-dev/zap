import { Address, erc20Abi, getContract, PublicClient, WalletClient } from 'viem';

export function erc20(address: Address, client: PublicClient | { public: PublicClient; wallet: WalletClient }) {
  const publicClient = 'public' in client ? client.public : client;
  const walletClient = 'wallet' in client ? client.wallet : undefined;

  const contract = getContract({
    address,
    abi: erc20Abi,
    client: walletClient
      ? {
          public: publicClient,
          wallet: walletClient,
        }
      : client,
  });

  const reads = {
    name: {
      contract: () => ({ address, abi: erc20Abi, functionName: 'name' }),
      call: async () => await contract.read.name(),
    },
    symbol: {
      contract: () => ({ address, abi: erc20Abi, functionName: 'symbol' }),
      call: async () => await contract.read.symbol(),
    },
    decimals: {
      contract: () => ({ address, abi: erc20Abi, functionName: 'decimals' }),
      call: async () => await contract.read.decimals(),
    },
    totalSupply: {
      contract: () => ({ address, abi: erc20Abi, functionName: 'totalSupply' }),
      call: async () => await contract.read.totalSupply(),
    },
    balanceOf: {
      contract: (owner: Address) => ({ address, abi: erc20Abi, functionName: 'balanceOf', args: [owner] }),
      call: async (owner: Address) => await contract.read.balanceOf([owner]),
    },
    allowance: {
      contract: (owner: Address, spender: Address) => ({
        address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [owner, spender],
      }),
      call: async (owner: Address, spender: Address) => await contract.read.allowance([owner, spender]),
    },
  };

  const writes = {
    async approve(spender: Address, amount: bigint): Promise<`0x${string}`> {
      if (!walletClient) throw new Error('Wallet client is required');
      if (!walletClient.account) throw new Error('Wallet client account is required');

      return contract.write.approve([spender, amount], { account: walletClient.account, chain: walletClient.chain });
    },

    async transfer(to: Address, amount: bigint): Promise<`0x${string}`> {
      if (!walletClient) throw new Error('Wallet client is required');
      if (!walletClient.account) throw new Error('Wallet client account is required');

      return contract.write.transfer([to, amount], { account: walletClient.account, chain: walletClient.chain });
    },
  };

  const utils = {
    tokenInfo: {
      contract: [
        reads.name.contract(),
        reads.symbol.contract(),
        reads.decimals.contract(),
        reads.totalSupply.contract(),
      ],
      call: async () => {
        const contracts = [
          reads.name.contract(),
          reads.symbol.contract(),
          reads.decimals.contract(),
          reads.totalSupply.contract(),
        ] as const;
        // @ts-ignore
        return await publicClient.multicall({ contracts });
      },
    },

    balancesOf: {
      contract: (addresses: Address[]) => addresses.map((address) => reads.balanceOf.contract(address)),
      call: async (addresses: Address[]) => {
        const contracts = addresses.map((address) => reads.balanceOf.contract(address));
        // @ts-ignore
        return await publicClient.multicall({ contracts });
      },
    },

    async approveIfNeeded(spender: Address, amount: bigint): Promise<`0x${string}` | null> {
      if (!walletClient) throw new Error('Wallet client is required');
      const [address] = await walletClient.getAddresses();
      const currentAllowance = await reads.allowance.call(address, spender);
      if (currentAllowance < amount) {
        return writes.approve(spender, amount);
      }

      return null;
    },

    async transferWithApproval(to: Address, amount: bigint): Promise<`0x${string}`> {
      const hash = await utils.approveIfNeeded(to, amount);
      if (hash) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      return writes.transfer(to, amount);
    },
  };

  return {
    contract,
    ...reads,
    ...writes,
    ...utils,
  };
}
