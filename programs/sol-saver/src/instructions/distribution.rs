use anchor_lang::prelude::*;
use crate::{state::*, errors::*};
use rand::Rng;

#[derive(Accounts)]
pub struct DistributionCtx<'info>{
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

pub fn distribution_handler(ctx: Context<DistributionCtx>, reward_amount: u64) -> Result<()>{
    msg!("Distributing {} tokens", reward_amount);
    let pool = &mut ctx.accounts.pool;
    // prize calculation
    let protocol_fee = (reward_amount as f64 * 0.4).round() as u64;
    let raw_prize = reward_amount - protocol_fee;
    let raw_daily_prize = (raw_prize as f64 * 0.5).round() as u64;
    let daily_prize = raw_daily_prize / 3;
    let weekly_prize = (raw_prize as f64 * 0.3).round() as u64;
    let monthly_prize = (raw_prize as f64 * 0.2).round() as u64;
    let season_prize = raw_prize - (daily_prize * 3) - weekly_prize - monthly_prize;

    // let prize_winners: Vec<Pubkey> = pool.prize_winners.daily.iter().map(|x: &(Pubkey, u64)| x.0).collect();
    // DAILY WINNERS
    // let prize_winners = pick_winners(pool.prize_winners.daily.clone().iter().map(|x: &(Pubkey, u64, bool)| x.0).collect(), pool.prize_winners.daily.iter().map(|x: &(Pubkey, u64, bool)| x.0).collect());
    // let winner1 = prize_winners[0];
    // let winner2 = prize_winners[1];
    // let winner3 = prize_winners[2];
    // // PRIZE DISTRIBUTION
    // pool.prize_winners.daily.push((winner1, daily_prize, false));
    // pool.prize_winners.daily.push((winner2, daily_prize, false));
    // pool.prize_winners.daily.push((winner3, daily_prize, false));

    // pool.amount = pool.amount.checked_add(reward_amount).unwrap();

    // pool.prize_pool.protocol_fee += protocol_fee;
    // pool.prize_pool.monthly_pool += monthly_prize;
    // pool.prize_pool.weekly_pool += weekly_prize;
    // pool.prize_pool.season_pool += season_prize;
    Ok(())
}

fn pick_winner(users: Vec<Pubkey>, winners: Vec<Pubkey>)-> Pubkey{
    let random_number = rand::thread_rng().gen_range(0..=users.len());
    let winner = &users[random_number];
    if winners.contains(winner){
        return pick_winner(users, winners);
    }
    return *winner;
}

fn pick_winners(users: Vec<Pubkey>, winners: Vec<Pubkey>)-> Vec<Pubkey>{
    let winner1 = pick_winner(users.clone(), winners.clone());
    let winner2 = pick_winner(users.clone(), winners.clone());
    let winner3 = pick_winner(users.clone(), winners.clone());
    return vec![winner1, winner2, winner3];
}