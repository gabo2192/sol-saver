use anchor_lang::prelude::*;
use crate::{state::*, errors::*};
use rand::Rng;

#[derive(Accounts)]
pub struct DistrubtionCompoundPrizesCtx<'info>{
    #[account(
        mut,
        seeds = [external_vault_destination.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, PoolState>,
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

pub fn distribution_compound_prizes_handler(ctx: Context<DistrubtionCompoundPrizesCtx>, raffle_type: u8) -> Result<()>{

    let pool = &mut ctx.accounts.pool;
    let random_number = rand::thread_rng().gen_range(0..=pool.users.users.len());
    let winner = pool.users.users[random_number].clone();

    // match raffle_type {
    //     0 =>{
    //         let prize = pool.prize_pool.weekly_pool.clone();  
        
    //         // PRIZE DISTRIBUTION
    //         pool.prize_winners.weekly.push((winner, prize, false));
    //         pool.prize_pool.weekly_pool = 0;
    //     }, 
    //     1 =>{
    //         let prize = pool.prize_pool.monthly_pool.clone();  
    //         // PRIZE DISTRIBUTION
    //         pool.prize_winners.monthly.push((winner, prize, false));
    //         pool.prize_pool.monthly_pool = 0;
    //     },
    //     2 =>{
    //         let prize = pool.prize_pool.season_pool.clone();  
    //         // PRIZE DISTRIBUTION
    //         pool.prize_winners.season.push((winner, prize, false));
    //         pool.prize_pool.season_pool = 0;
    //     },
    //     _ => return Err(StakeError::InvalidRaffleType.into())
    // }
    Ok(())
}