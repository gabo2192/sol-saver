pub mod errors;
pub mod instructions;
pub mod state;
use {anchor_lang::prelude::*, instructions::*};

declare_id!("BxRivoj1QuavXdB6buPEitCqQnBE8kfpCiwKdhMx4cEx");

#[program]
pub mod sol_token_saver {
    use super::*;

    pub fn init_pool_token(ctx: Context<InitializePool>) -> Result<()>{
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
}

#[derive(Accounts)]
pub struct Initialize {}
