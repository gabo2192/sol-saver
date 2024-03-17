export interface IPool {
  id: number;
  tokenName: string;
  tokenLogoUri: string;
  tokenSymbol: string;
  poolAddress: string;
  tokenVault: string;
  tokenMint?: string;
}

export interface ICreatePool {
  tokenName: string;
  tokenLogoUri: string;
  tokenSymbol: string;
  tokenMint?: string;
  tokenVault: string;
  poolAddress: string;
}
