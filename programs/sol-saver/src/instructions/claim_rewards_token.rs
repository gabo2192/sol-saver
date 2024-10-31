use {
    crate::{errors::*, state::*, utils::*}, 
    anchor_lang::{prelude::*, system_program::{transfer, Transfer}}, 
};
#[derive(Accounts)]
pub struct ClaimRewardsTokenCtx<'info>{
    #[account(
        mut,
        seeds = [external_vault_destination.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, PoolState>,
    #[account(mut)] 
    pub external_vault_destination: Signer<'info>,    
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        constraint = program_authority.key() == PROGRAM_AUTHORITY
        @ StakeError::InvalidProgramAuthority
    )]
    pub program_authority: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn claim_rewards_token_handler(ctx: Context<ClaimCtx>) -> Result<()>{
    let pool = &mut ctx.accounts.pool;
    let mut prize = 0;
    // check if user is winner of any prize
    for raffle_type in [RaffleEnum::Weekly, RaffleEnum::Monthly, RaffleEnum::Season] {
        if let Some((_, prize_amount, claimed)) = get_winner(&pool.prize_winners, raffle_type.clone(), ctx.accounts.user.key()) {
            if !claimed {
                prize += prize_amount;
                update_claim_status(&mut pool.prize_winners, raffle_type.clone(), ctx.accounts.user.key());
            } 
        }
    }

    msg!("Out amount returned: {}", prize);
    msg!("Total staked before withdrawal: {}", ctx.accounts.pool.amount);
    let transfer_amount = prize;

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


impl<'info> ClaimRewardsTokenCtx <'info> {
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

