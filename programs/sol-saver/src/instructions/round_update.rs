use {
    crate::{errors::*, state::*}, anchor_lang::prelude::*
};

#[derive(Accounts)]
pub struct RoundUpdateCtx<'info> {
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
    pub system_program: Program<'info, System>
}


pub fn round_update_handler(ctx: Context<RoundUpdateCtx>, round: Round) -> Result<()>{
    let pool = &mut ctx.accounts.pool_state;
    // pool.round.day = round.day;
    // pool.round.week = round.week;
    // pool.round.month = round.month;
    // pool.round.season = round.season;    

    let waiting_users = pool.users.waiting_users.clone();
    pool.users.users.extend(waiting_users);
    pool.users.waiting_users.clear();
    Ok(())
}