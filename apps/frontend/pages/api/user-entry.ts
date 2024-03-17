import { PublicKey } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
const secret = process.env.NEXTAUTH_SECRET!;

export default async function stake(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub)
    return res.send({
      error: "User wallet not authenticated",
    });
  const tokenMint = req.query.tokenMint;
  const programId = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_PUBKEY as string
  );
  const userKey = new PublicKey(token.sub as string);
  if (!tokenMint) {
    // get cookies from request
    const [userEntry] = PublicKey.findProgramAddressSync(
      [userKey.toBuffer(), Buffer.from(process.env.STAKE_ENTRY_STATE_SEED!)],
      programId
    );

    return res.status(200).json(userEntry);
  }
  const mintKey = new PublicKey(tokenMint);
  // get cookies from request
  const [userEntry] = PublicKey.findProgramAddressSync(
    [
      userKey.toBuffer(),
      mintKey.toBuffer(),
      Buffer.from(process.env.STAKE_ENTRY_STATE_SEED!),
    ],
    programId
  );
  return res.status(200).json(userEntry);
}
