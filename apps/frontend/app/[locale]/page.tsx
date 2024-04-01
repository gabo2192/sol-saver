import { PoolContainer } from "@components/pool-container";
import backendClient from "@lib/backend-client";
import { Pool } from "@types";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const { data: pools } = await backendClient.get<Pool[]>("/pool");
  const solanaPrice = 180;
  const t = await getTranslations("home");

  return (
    <>
      <h2 className="font-medium text-foreground text-center text-2xl mt-2 mb-1">
        {t("title")}
      </h2>
      <p className="font-medium text-foreground text-center text-md">
        {t("description")}
      </p>
      {pools
        .sort((a, b) => a.id - b.id)
        .map((pool) => (
          <PoolContainer pool={pool} key={pool.id} />
        ))}
    </>
  );
}
