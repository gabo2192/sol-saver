import { secret } from "@lib/auth";
import { PublicKey } from "@solana/web3.js";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub)
    return NextResponse.json({}, { status: 401, statusText: "Unauthorized" });

  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const tokenMint = searchParams.get("tokenMint");

  const userKey = new PublicKey(token.sub as string);
  if (!tokenMint) {
    const programId = new PublicKey(
      process.env.NEXT_PUBLIC_PROGRAM_PUBKEY as string
    );
    const [userEntry] = PublicKey.findProgramAddressSync(
      [userKey.toBuffer(), Buffer.from(process.env.STAKE_ENTRY_STATE_SEED!)],
      programId
    );
    return NextResponse.json(userEntry);
  }
  const mintKey = new PublicKey(tokenMint);
  const programId = new PublicKey(
    process.env.NEXT_PUBLIC_TOKEN_PROGRAM_PUBKEY as string
  );
  const [userEntry] = PublicKey.findProgramAddressSync(
    [
      userKey.toBuffer(),
      mintKey.toBuffer(),
      Buffer.from(process.env.STAKE_ENTRY_STATE_SEED!),
    ],
    programId
  );

  return NextResponse.json(userEntry);
}
