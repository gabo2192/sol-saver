use {
    crate::{errors::*, state::*, utils::*}, 
    anchor_lang::prelude::*, 
    anchor_spl::token::{TokenAccount, Token, Transfer, transfer},
};


#[derive(Accounts)]
pub struct UnstakeTokenCtx<'info>{
    #[account(
        mut,
        seeds = [external_vault_destination.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, PoolState>,
    /// CHECK:
    #[account(mut)]  // Ensure mutability for transfer
    pub external_vault_destination: Signer<'info>,  // Added for SOL transfer
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
    #[account(
        mut,
        constraint = user_token_account.mint == pool.token_mint
        @ StakeError::InvalidMint
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

pub fn unstake_token_handler(ctx: Context<UnstakeTokenCtx>) -> Result<()>{
    let out_amount = ctx.accounts.user_stake_entry.balance;
    let fee_amount = 2000;
    let pool = &mut ctx.accounts.pool;
    if out_amount < fee_amount {
        return Err(StakeError::InsufficientFunds.into());
    }
    let mut prize = 0;
    // check if user is winner of any prize
    // for raffle_type in [0,1,2] {
    //     if let Some((_, prize_amount, claimed)) = get_winner(&pool.prize_winners, raffle_type.clone(), ctx.accounts.user.key()) {
    //         if !claimed {
    //             prize += prize_amount;
    //             update_claim_status(&mut pool.prize_winners, raffle_type.clone(), ctx.accounts.user.key());
    //         } 
    //     }
    // }

    msg!("Out amount returned: {}", out_amount);
    msg!("Total staked before withdrawal: {}", ctx.accounts.pool.amount);
    let transfer_amount = prize + out_amount - fee_amount;

    transfer(ctx.accounts.transfer_ctx(), transfer_amount)?;

    let pool = &mut ctx.accounts.pool;
    let user_entry = &mut ctx.accounts.user_stake_entry;

    pool.amount = pool.amount.checked_sub(out_amount).unwrap();
    pool.user_desposit_amount = pool.user_desposit_amount.checked_sub(user_entry.balance).unwrap();

    msg!("Total staked after withdrawal: {}", pool.amount);
    msg!("Amount deposited by users: {}", pool.user_desposit_amount);
    user_entry.balance = 0;
    Ok(())
}   



impl<'info> UnstakeTokenCtx <'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.external_vault_destination.to_account_info(),
            to: self.user_token_account.to_account_info(),
            authority: self.user.to_account_info()
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

