import backendClient from "@lib/backend-client";
import { Prize } from "@types";
import PrizeTable from "./components/prize-table";

interface Props {
  params: {
    id: string;
  };
}

export default async function Page({ params: { id } }: Props) {
  const { data: prizes } = await backendClient.get<Prize[]>("/prize/" + id);
  console.log({ prizes });
  return <PrizeTable prizes={prizes} />;
}
