use {
    crate::{errors::*, state::*}, anchor_lang::prelude::*
};

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        seeds = [external_vault_destination.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump,
        payer = program_authority,
        space = 8 + STAKE_POOL_SIZE
    )]
    pub pool_state: Account<'info, PoolState>,
    /// CHECK:
    #[account(mut)]
    pub external_vault_destination: AccountInfo<'info>,
    #[account(
        mut,
        constraint = program_authority.key() == PROGRAM_AUTHORITY
        @ StakeError::InvalidProgramAuthority
    )]
    pub program_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
  
}


pub fn init_pool_handler(ctx: Context<InitializePool>) -> Result<()>{
    let pool_state= &mut ctx.accounts.pool_state;

    pool_state.bump = ctx.bumps.pool_state;
    pool_state.amount = 0;
    pool_state.user_deposit_amt = 0;
    pool_state.initialized_at = Clock::get().unwrap().unix_timestamp;
    pool_state.last_reward_timestamp = 0;
    pool_state.external_vault_destination = ctx.accounts.external_vault_destination.key();
    pool_state.authority = ctx.accounts.program_authority.key();
    
    Ok(())
}