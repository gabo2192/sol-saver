use {
    anchor_lang::prelude::*,
    crate::state::*,
};


#[derive(Accounts)]
pub struct InitTokenEntryCtx<'info>{
    #[account(mut)]
    pub user : Signer<'info>,
    #[account(
        init,
        seeds = [user.key().as_ref(), pool_state.token_mint.key().as_ref(), STAKE_ENTRY_SEED.as_bytes()],
        bump,
        payer = user,
        space = STAKE_ENTRY_SIZE
    )]
    pub user_stake_entry: Account<'info, StakeEntry>,
    #[account(
        seeds = [pool_state.external_vault_destination.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool_state.bump
    )]
    pub pool_state: Account<'info, PoolState>,
    pub system_program: Program<'info, System>,
}

pub fn init_token_stake_entry_handler(ctx: Context<InitTokenEntryCtx>) -> Result<()>{

    let user_entry = &mut ctx.accounts.user_stake_entry;
    user_entry.user = ctx.accounts.user.key();
    user_entry.bump = ctx.bumps.user_stake_entry;
    user_entry.balance = 0;
    user_entry.initial_distribution_rate = 0;
    Ok(())
}