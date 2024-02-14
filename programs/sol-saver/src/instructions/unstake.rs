use {
    crate::{state::*, errors::*}, 
    anchor_lang::{prelude::*, system_program::{transfer, Transfer}}, 
};
#[derive(Accounts)]
pub struct UnstakeCtx<'info>{
    #[account(
        mut,
        seeds = [STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, PoolState>,
    /// CHECK:
    #[account(mut)]  // Ensure mutability for transfer
    pub external_sol_destination: Signer<'info>,  // Added for SOL transfer
    /// CHECK:
    #[account(
        mut
    )]
    pub user: AccountInfo<'info>,
    #[account(
        mut, 
        seeds = [user.key().as_ref(), STAKE_ENTRY_SEED.as_bytes()],
        bump = user_stake_entry.bump
    )]
    pub user_stake_entry: Account<'info, StakeEntry>,
    pub system_program: Program<'info, System>
}

pub fn unstake_handler(ctx: Context<UnstakeCtx>) -> Result<()>{
    let out_amount = ctx.accounts.user_stake_entry.balance;
    msg!("Out amount returned: {}", out_amount);
    msg!("Total staked before withdrawal: {}", ctx.accounts.pool.total_staked_sol);


    transfer(ctx.accounts.transfer_ctx(), out_amount)?;

    let pool = &mut ctx.accounts.pool;
    let user_entry = &mut ctx.accounts.user_stake_entry;

    pool.total_staked_sol = pool.total_staked_sol.checked_sub(out_amount).unwrap();
    pool.user_deposit_amt = pool.user_deposit_amt.checked_sub(user_entry.balance).unwrap();

    msg!("Total staked after withdrawal: {}", pool.total_staked_sol);
    msg!("Amount deposited by users: {}", pool.user_deposit_amt);
    
    Ok(())
}   


impl<'info> UnstakeCtx <'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.external_sol_destination.to_account_info(),
            to: self.user.to_account_info(),
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}