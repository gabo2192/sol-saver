use {
    anchor_lang::prelude::*,
    solana_program::{pubkey, pubkey::Pubkey},
};

pub const STAKE_POOL_STATE_SEED: &str = "state";
pub const STAKE_POOL_SIZE: usize = 8 + 32 + 1 + 8 + 32  + 1 + 1 + 32 + 8 + 8 + 32 + 32; 
pub const TOKEN_STAKE_POOL_SIZE: usize = 8 + 32 + 32 + 1 + 8 + 32 + 8 + 1 + 1 + 32 + 16 + 8;

pub const VAULT_SEED: &str = "vault";
pub const VAULT_AUTH_SEED: &str = "vault_authority";

pub static PROGRAM_AUTHORITY: Pubkey = pubkey!("H9uX2etBfTv7Sd6puRsMTtVvqCSVfPNfZ91muG7N2xLZ");

pub const STAKE_ENTRY_SEED: &str = "stake_entry";
pub const STAKE_ENTRY_SIZE: usize = 8 + 32 + 1 + 8 + 8 + 16;


#[account]
pub struct PoolState {
    pub authority: Pubkey,
    pub bump: u8,
    pub amount: u64,
    pub external_vault_destination: Pubkey,
    pub token_mint: Pubkey,
    pub initialized_at: i64,
    pub distribution_rate: u128,
    pub user_deposit_amt: u64
}

#[account]
pub struct StakeEntry {
    pub user: Pubkey,
    pub bump: u8,
    pub balance: u64,
    pub last_staked: i64,
    pub initial_distribution_rate: u64
}
