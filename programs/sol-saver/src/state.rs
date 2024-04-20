use {
    anchor_lang::prelude::*,
    solana_program::{pubkey, pubkey::Pubkey},
};


pub const STAKE_POOL_STATE_SEED: &str = "state";
pub const VAULT_SEED: &str = "vault";
pub const VAULT_AUTH_SEED: &str = "vault_authority";
pub const STAKE_ENTRY_SEED: &str = "stake_entry";

pub static PROGRAM_AUTHORITY: Pubkey = pubkey!("H9uX2etBfTv7Sd6puRsMTtVvqCSVfPNfZ91muG7N2xLZ");

pub const STAKE_POOL_SIZE: usize = 8 + std::mem::size_of::<PoolState>(); 
pub const STAKE_ENTRY_SIZE: usize = 8 + std::mem::size_of::<StakeEntry>();

#[account]
pub struct PoolState {
    // The bump for the vault pda
    pub bump: u8,
    // The authority for the pool
    pub authority: Pubkey,
    // external token account for the vault e.g. USDC
    pub external_vault_destination: Pubkey,
    // external vault
    pub token_mint: Pubkey,
    // lifetime total withdrawals
    pub amount: u64,
    // the min_deposite_amount
    pub min_deposit_amount: u64,
    // vector of users in the pool and their shares
    pub users: Vec<(Pubkey, u64)>,
    // vector of users waiting for the next round
    pub waiting_users: Vec<(Pubkey, u64)>,
    // winner
    pub winners: Vec<(Pubkey, u64)>,
    // tiemstamp of when the pool was initialized
    pub init_ts: i64,
    // the round number
    pub round: u64,
    // week number
    pub week: u64,
    // month number
    pub month: u64,
    // season number
    pub season: u64,
}



#[account]
pub struct StakeEntry {
    pub user: Pubkey,
    pub bump: u8,
    pub balance: u64,
    pub last_staked: i64,
}
