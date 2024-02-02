use {
    anchor_lang::prelude::*,
    crate::state::*,
};

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init_if_needed,
        seeds = [STAKE_POOL_STATE_SEED.as_bytes()],
        bump,
        payer = program_authority,
        space = 8 + STAKE_POOL_SIZE
    )]
    pub pool_state: Account<'info, PoolState>,
    /// CHECK:
    #[account(mut)]
    pub external_sol_destination: AccountInfo<'info>,
    #[account(mut)]
    pub program_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}


pub fn init_pool_handler(ctx: Context<InitializePool>) -> Result<()>{
    let pool_state= &mut ctx.accounts.pool_state;
    pool_state.bump = ctx.bumps.pool_state;
    pool_state.total_staked_sol = 0;
    pool_state.user_deposit_amt = 0;
    pool_state.reward_per_sol = 1;
    pool_state.initialized_at = Clock::get().unwrap().unix_timestamp;
    pool_state.last_reward_timestamp = 0;
    pool_state.external_sol_destination = ctx.accounts.external_sol_destination.key();
    pool_state.authority = ctx.accounts.program_authority.key();
    Ok(())
}