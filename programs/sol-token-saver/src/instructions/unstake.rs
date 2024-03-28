use {
    crate::{errors::*, state::*}, 
    anchor_lang::prelude::*, 
    anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer},

};
#[derive(Accounts)]
pub struct UnstakeCtx<'info>{
    #[account(
        mut,
        has_one = external_vault_destination,
        seeds = [external_vault_destination.key().as_ref(),STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, PoolState>,
    /// CHECK:
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

    #[account(
        mut,
        constraint = token_mint.key() == pool.token_mint
        @ StakeError::InvalidMint
    )]
    
    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

pub fn unstake_handler(ctx: Context<UnstakeCtx>) -> Result<()>{
    let out_amount = ctx.accounts.user_stake_entry.balance;
    let fee_amount = 20000;
    if out_amount < fee_amount {
        return Err(StakeError::InsufficientFunds.into());
    }
    msg!("Out amount returned: {}", out_amount);
    msg!("Total staked before withdrawal: {}", ctx.accounts.pool.amount);
    let transfer_amount = out_amount - fee_amount;

    transfer(ctx.accounts.transfer_ctx(), transfer_amount)?;

    let pool = &mut ctx.accounts.pool;
    let user_entry = &mut ctx.accounts.user_stake_entry;

    pool.amount = pool.amount.checked_sub(out_amount).unwrap();
    pool.user_deposit_amt = pool.user_deposit_amt.checked_sub(user_entry.balance).unwrap();

    msg!("Total staked after withdrawal: {}", pool.amount);
    msg!("Amount deposited by users: {}", pool.user_deposit_amt);
    user_entry.balance = 0;
    Ok(())
}   


impl<'info> UnstakeCtx <'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.external_vault_destination.to_account_info(),
            to: self.user.to_account_info(),
            authority: self.pool.to_account_info()

        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}
