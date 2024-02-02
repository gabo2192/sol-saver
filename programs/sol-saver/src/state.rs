use {
    anchor_lang::prelude::*,
    solana_program::{pubkey, pubkey::Pubkey},
};

pub const STAKE_POOL_STATE_SEED: &str = "state";
pub const STAKE_POOL_SIZE: usize = 8 + 32 + 1 + 8 + 32 + 8 + 1 + 1 + 32 + 8 + 8; 

pub const VAULT_SEED: &str = "vault";
pub const VAULT_AUTH_SEED: &str = "vault_authority";

pub static PROGRAM_AUTHORITY: Pubkey = pubkey!("H9uX2etBfTv7Sd6puRsMTtVvqCSVfPNfZ91muG7N2xLZ");

pub const STAKE_ENTRY_SEED: &str = "stake_entry";
pub const STAKE_ENTRY_SIZE: usize = 8 + 32 + 1 + 8 + 8 + 16;

#[derive(Debug)]
#[account]
pub struct PoolState {
    pub bump: u8,
    pub total_staked_sol: u64,
    pub initialized_at: i64,
    pub reward_per_sol: u64, // Adjusted field for SOL rewards
    pub last_reward_timestamp: i64, // Added field for tracking rewards
    pub user_deposit_amt: u64,
    pub external_sol_destination: Pubkey,
    pub authority: Pubkey,
}

#[account]
pub struct StakeEntry {
    pub user: Pubkey,
    pub bump: u8,
    pub balance: u64,
    pub last_staked: i64,
    pub initial_distribution_rate: u64
}

// pub fn calculate_out_amount(pool_state: &PoolState, user_stake_entry: &StakeEntry) -> u128 {
//     // using a single distribution rate
//     // let distribution_rate: u128;

//     // if user_stake_entry.initial_distribution_rate == 1 {
//     //     distribution_rate = pool_state.distribution_rate;
//     //     msg!("initial rate == 1");
//     //     msg!("Distribution rate: {}", distribution_rate);
//     // } else {
//     //     distribution_rate = pool_state.distribution_rate.checked_mul(RATE_MULT).unwrap()
//     //                             .checked_div(user_stake_entry.initial_distribution_rate).unwrap();
//     //     msg!("Distribution rate: {}", distribution_rate);
//     // }

//     msg!("User staked amount: {}", user_stake_entry.balance);
//     let amount: u64 = user_stake_entry.balance;
    

//     // out_amount = (amount as u128).checked_mul(distribution_rate).unwrap().checked_div(RATE_MULT).unwrap();
//     // msg!("Amount after rewards/burn: {}", out_amount);

//     amount
// }