use {
    anchor_lang::{prelude::*, system_program::{transfer, Transfer}},
    crate::{state::*, errors::*},
};


#[derive(Accounts)]
pub struct StakeCtx<'info> {
    #[account(
        mut,
        seeds = [STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, PoolState>,
    /// CHECK:
    #[account(mut)]
    pub external_sol_destination: AccountInfo<'info>,
    #[account(
        mut,
        constraint = user.key() == user_stake_entry.user
        @ StakeError::InvalidUser
    )]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [user.key().as_ref(), STAKE_ENTRY_SEED.as_bytes()],
        bump = user_stake_entry.bump
    )]
    pub user_stake_entry: Account<'info, StakeEntry>,
    pub system_program: Program<'info, System>
}

pub fn stake_handler(ctx: Context<StakeCtx>, stake_amount: u64) -> Result<()> {
    msg!("Staking {} tokens", stake_amount);
    // transfer amount from user token acct to vault
    transfer(ctx.accounts.transfer_ctx(), stake_amount)?;

    msg!("Pool initial total: {}", ctx.accounts.pool.total_staked_sol);
    msg!("Initial user deposits: {}", ctx.accounts.pool.user_deposit_amt);
    msg!("User entry initial balance: {}", ctx.accounts.user_stake_entry.balance);
    ctx.accounts.user_stake_entry.initial_distribution_rate = ctx.accounts.pool.reward_per_sol;

    // update pool state amount
    let pool = &mut ctx.accounts.pool;
    let user_entry = &mut ctx.accounts.user_stake_entry;
    msg!("Current pool: {:?}", pool);

    pool.total_staked_sol = pool.total_staked_sol.checked_add(stake_amount).unwrap();
    pool.user_deposit_amt = pool.user_deposit_amt.checked_add(stake_amount).unwrap();
    msg!("Current pool total: {}", pool.total_staked_sol);
    msg!("Amount of tokens deposited by users: {}", pool.user_deposit_amt);

    // update user stake entry
    user_entry.balance = user_entry.balance.checked_add(stake_amount).unwrap();
    msg!("User entry balance: {}", user_entry.balance);
    user_entry.last_staked = Clock::get().unwrap().unix_timestamp;

    Ok(())
}


impl<'info> StakeCtx <'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.external_sol_destination.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}