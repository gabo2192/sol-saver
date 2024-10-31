// use solana_program::pubkey::Pubkey;
// use crate::state::*;

// pub fn get_winner(prize_winners: &PrizeWinners, raffle_type: u8, winner_pubkey: Pubkey) -> Option<(Pubkey, u64, bool)> {
//     match raffle_type {
//         0 => prize_winners.weekly.iter().find(|w| w.0 == winner_pubkey).cloned(),
//         1 => prize_winners.monthly.iter().find(|w| w.0 == winner_pubkey).cloned(),
//         2 => prize_winners.season.iter().find(|w| w.0 == winner_pubkey).cloned(),
//         _ => None
//     }
// }

// pub fn update_claim_status(prize_winners: &mut PrizeWinners, raffle_type: u8, winner_pubkey: Pubkey) {
//     match raffle_type {
//         0 => if let Some((_, _, ref mut claimed)) = prize_winners.weekly.iter_mut().find(|w| w.0 == winner_pubkey) {
//             *claimed = true;
//         },
//         1 => if let Some((_, _, ref mut claimed)) = prize_winners.monthly.iter_mut().find(|w| w.0 == winner_pubkey) {
//             *claimed = true;
//         },
//         2 => if let Some((_, _, ref mut claimed)) = prize_winners.season.iter_mut().find(|w| w.0 == winner_pubkey) {
//             *claimed = true;
//         },
//         _ => {}
//     }
// }