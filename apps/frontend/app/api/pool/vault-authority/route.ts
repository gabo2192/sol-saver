import { secret } from "@lib/auth";
import { PublicKey } from "@solana/web3.js";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub)
    return NextResponse.json({}, { status: 401, statusText: "Unauthorized" });

  const vault_authority = process.env.VAULT_AUTHORITY as string;
  const programId = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_PUBKEY as string
  );
  let [vaultAuthority] = await PublicKey.findProgramAddressSync(
    [Buffer.from(vault_authority)],
    programId
  );

  return NextResponse.json({ vaultAuthority: vaultAuthority.toBase58() });
}
