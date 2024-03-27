import { secret } from "@lib/auth";
import backendClient from "@lib/backend-client";
import { PublicKey } from "@solana/web3.js";
import { Pool } from "@types";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub)
    return NextResponse.json({}, { status: 401, statusText: "Unauthorized" });

  const vault_authority = process.env.VAULT_AUTHORITY as string;
  const vault_seed = process.env.VAULT_SEED as string;
  const programId = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_PUBKEY as string
  );
  let [vaultAuthority] = await PublicKey.findProgramAddressSync(
    [Buffer.from(vault_authority)],
    programId
  );
  const url = new URL(req.url);
  const poolId = url.pathname.replace("/api/pool/token-vault/", "");
  const { data: pool } = await backendClient.get<Pool>(`/pool/${poolId}`);
  const tokenMint = new PublicKey(pool.tokenMint);
  const vaultAuthKey = new PublicKey(vaultAuthority);

  const [vault] = await PublicKey.findProgramAddressSync(
    [tokenMint.toBuffer(), vaultAuthKey.toBuffer(), Buffer.from(vault_seed)],
    programId
  );
  return NextResponse.json({ vault });
}
