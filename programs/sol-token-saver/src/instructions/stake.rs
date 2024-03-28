use {
    anchor_lang::prelude::*,
    crate::{state::*, errors::*},
    anchor_spl::token::{TokenAccount, Token, Transfer, transfer},
};



#[derive(Accounts)]
pub struct StakeCtx <'info> {
    #[account(
        mut,
        seeds = [external_vault_destination.key().as_ref(), pool.token_mint.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, PoolState>,
    #[account(mut)]
    pub external_vault_destination: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = user.key() == user_stake_entry.user
        @ StakeError::InvalidUser
    )]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [user.key().as_ref(), pool.token_mint.key().as_ref(), STAKE_ENTRY_SEED.as_bytes()],
        bump = user_stake_entry.bump
    )]
    pub user_stake_entry: Account<'info, StakeEntry>,
    #[account(
        mut,
        constraint = user_token_account.mint == pool.token_mint
        @ StakeError::InvalidMint
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

pub fn stake_handler(ctx: Context<StakeCtx>, stake_amount: u64) -> Result<()> {
    // transfer amount from user token acct to vault
    transfer(ctx.accounts.transfer_ctx(), stake_amount)?;

    msg!("Pool initial total: {}", ctx.accounts.pool.amount);
    msg!("Initial user deposits: {}", ctx.accounts.pool.user_deposit_amt);
    msg!("User entry initial balance: {}", ctx.accounts.user_stake_entry.balance);

    // update pool state amount
    let pool = &mut ctx.accounts.pool;
    let user_entry = &mut ctx.accounts.user_stake_entry;
    pool.amount = pool.amount.checked_add(stake_amount).unwrap();
    pool.user_deposit_amt = pool.user_deposit_amt.checked_add(stake_amount).unwrap();
    msg!("Current pool total: {}", pool.amount);
    msg!("Amount of tokens deposited by users: {}", pool.user_deposit_amt);

    // update user stake entry
    user_entry.balance = user_entry.balance.checked_add(stake_amount).unwrap();
    msg!("User entry balance: {}", user_entry.balance);
    user_entry.last_staked = Clock::get().unwrap().unix_timestamp;

    Ok(())
}

impl<'info> StakeCtx <'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.user_token_account.to_account_info(),
            to: self.external_vault_destination.to_account_info(),
            authority: self.user.to_account_info()
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}