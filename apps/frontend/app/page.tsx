import { PoolContainer } from "@components/pool-container";
import backendClient from "@lib/backend-client";
import { Pool } from "@types";

export default async function Page() {
  const { data: pools } = await backendClient.get<Pool[]>("/pool");
  const solanaPrice = 180;
  return (
    <>
      <h2 className="font-medium text-foreground text-center text-2xl mt-2 mb-1">
        Stake to win Prizes
      </h2>
      <p className="font-medium text-foreground text-center text-md">
        Stake your tokens to win prizes
      </p>
      {pools
        .sort((a, b) => a.id - b.id)
        .map((pool) => (
          <PoolContainer pool={pool} key={pool.id} />
        ))}
    </>
  );
}
