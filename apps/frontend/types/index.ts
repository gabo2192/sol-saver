export interface StakeEntry {
  id: string;
  balance: number;
  lastStakedAt: string;
  pool: Pool;
  publicKey: string;
}

export interface Pool {
  id: number;
  tokenSymbol: string;
  tokenName: string;
  tokenLogoUri: string;
  supply: number;
  supplyApy: number;
  poolAddress: string;
  tokenVault: string;
  decimals: number;
  tokenMint: string;
  createdAt: string;
}

export interface User {
  id: string;
  publicKey: string;
  stakeEntries: StakeEntry[];
}

export interface Prize {
  id: number;
  amount: string;
  isClaimed: boolean;
  createdAt: string;
  updteadAt: string;
  user: User;
  pool: Pool;
}
