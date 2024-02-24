export interface IPool {
  id: number;
  tokenName: string;
  tokenLogoUri: string;
  tokenSymbol: string;
  poolAddress: string;
  tokenVault: string;
  tokenAddress?: string;
}

export interface ICreatePool {
  tokenName: string;
  tokenLogoUri: string;
  tokenSymbol: string;
  tokenAddress?: string;
  tokenVault: string;
  poolAddress: string;
}
