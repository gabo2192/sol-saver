import { AirdropContainer } from "@components/airdrop-container";
import { PoolContainer } from "@components/pool-container";
import backendClient from "@lib/backend-client";
import { Pool } from "@types";
import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export default async function Page({ params: { id } }: Props) {
  const { data: pool } = await backendClient.get<Pool>(`/pool/${id}`);
  if (!pool) return notFound();

  return (
    <>
      <PoolContainer pool={pool} />
      {pool.tokenMint && <AirdropContainer tokenMint={pool.tokenMint} />}
    </>
  );
}
