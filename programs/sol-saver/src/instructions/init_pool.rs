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
    pool_state.authority = ctx.accounts.program_authority.key();
    pool_state.external_vault_destination = ctx.accounts.external_vault_destination.key();
    // pool_state.users = vec![];
    // pool_state.waiting_users = vec![];
    // pool_state.prize_winners = PrizeWinners{
    //     daily: vec![],
    //     weekly: vec![],
    //     monthly: vec![],
    //     season: vec![],
    // };
    pool_state.init_ts = Clock::get()?.unix_timestamp;
    pool_state.min_deposit_amount = 1000;
    // round starts at 0 once we start staking season and round starts 
    // pool_state.round = Round{
    //     day: 0,
    //     week: 0,
    //     month: 0,
    //     season: 0,
    // };
    // pool_state.prize_pool = PrizePool{
    //     weekly_pool: 0,
    //     monthly_pool:0,
    //     protocol_fee: 0,
    //     season_pool: 0
    // };
    
    Ok(())
}