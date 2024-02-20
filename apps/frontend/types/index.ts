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
}

export interface User {
  id: string;
  publickey: string;
  stakeEntries: StakeEntry[];
}
