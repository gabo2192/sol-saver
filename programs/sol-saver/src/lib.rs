pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;
use crate::state::*;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("8L6PYBgDY1XC64VN6qeDrJtVp6titb2eE6Biaxkinooy");

#[program]
pub mod sol_saver {
    use super::*;

    pub fn init_pool(ctx: Context<InitializePool>)-> Result<()>{
        init_pool_handler(ctx)
    }

    pub fn init_stake_entry(ctx: Context<InitEntryCtx>) -> Result<()>{
        init_stake_entry_handler(ctx)
    }

   
    pub fn stake(ctx: Context<StakeCtx>, stake_amount: u64) -> Result<()>{
        stake_handler(ctx, stake_amount)
    }
    pub fn unstake(ctx: Context<UnstakeCtx>) -> Result<()>{
        unstake_handler(ctx)
    }

    pub fn init_pool_token(ctx: Context<InitializeTokenPool>) -> Result<()>{
        init_pool_token_handler(ctx)
    }

    pub fn init_token_stake_entry(ctx: Context<InitTokenEntryCtx>) -> Result<()>{
        init_token_stake_entry_handler(ctx)
    }

    pub fn stake_token(ctx: Context<StakeTokenCtx>, stake_amount: u64) -> Result<()>{
        stake_token_handler(ctx, stake_amount)
    }

    pub fn unstake_token(ctx: Context<UnstakeTokenCtx>) -> Result<()>{
        unstake_token_handler(ctx)
    }

    pub fn round_update(ctx: Context<RoundUpdateCtx>, round: Round) -> Result<()>{
        round_update_handler(ctx, round)
    }

    pub fn distribute(ctx: Context<DistributionCtx>,reward_amount: u64) -> Result<()>{
        distribution_handler(ctx, reward_amount)
    }

    pub fn distribute_compound_prizes(ctx: Context<DistrubtionCompoundPrizesCtx>, raffle_type: u8) -> Result<()>{
        distribution_compound_prizes_handler(ctx, raffle_type)
    }

 
}
