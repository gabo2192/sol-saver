import { PublicKey } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { parseJwt } from "../../utils/parse-jwt";
const secret = process.env.NEXTAUTH_SECRET!;

export default async function stake(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub)
    return res.send({
      error: "User wallet not authenticated",
    });

  const programId = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_PUBKEY as string
  );
  const parsedJwtToken = parseJwt(token?.sub ?? '')
  if (parsedJwtToken){
    const userKey = new PublicKey(parsedJwtToken.id as string);
    // get cookies from request
    const [userEntry] = PublicKey.findProgramAddressSync(
      [userKey.toBuffer(), Buffer.from(process.env.STAKE_ENTRY_STATE_SEED!)],
      programId
    );
    return res.status(200).json(userEntry);
  } else {
      return res.send({
      error: "User wallet is incorrect",
    });
  }
}
