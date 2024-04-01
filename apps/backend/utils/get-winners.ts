export async function getDailyWinner(
  users: { id: string; balance: number }[],
  balance: number,
) {
  const randomNumber = Math.random() * balance;
  console.log({ randomNumber });
  const totalStakedByUsers = users.map((user) => ({
    id: user.id,
    balance: user.balance,
  }));
  const winner = await pickAWinnerByBalance(totalStakedByUsers, randomNumber);
  return winner;
}

export async function getWinner(users: { id: string; balance: number }[]) {
  const randomNumber = Math.floor(Math.random() * users.length);

  const winner = users[randomNumber].id;

  return winner;
}

async function pickAWinnerByBalance(
  users: {
    id: string;
    balance: number;
  }[],
  randomNumber: number,
) {
  let cumulativeBalance = 0;

  for (const user of users) {
    cumulativeBalance += Number(user.balance);
    if (cumulativeBalance > randomNumber) {
      return user.id;
    }
  }
  return null;
}
