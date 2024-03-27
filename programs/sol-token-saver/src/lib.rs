pub mod errors;
pub mod instructions;
pub mod state;
use anchor_lang::prelude::*;

declare_id!("BxRivoj1QuavXdB6buPEitCqQnBE8kfpCiwKdhMx4cEx");

#[program]
pub mod sol_token_saver {
    use super::*;

    pub fn init_pool_token(ctx: Context<InitializeTokenPool>) -> Result<()>{
        init_pool_token_handler(ctx)
    }
    pub fn init_token_stake_entry(ctx: Context<InitTokenEntryCtx>) -> Result<()>{
        init_token_stake_entry_handler(ctx)
    }
    pub fn stake_token(ctx: Context<StakeTokenCtx>, stake_amount: u64) -> Result<()>{
        stake_token_handler(ctx, stake_amount)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
