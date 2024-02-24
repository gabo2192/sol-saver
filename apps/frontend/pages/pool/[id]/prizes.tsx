import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import axios from "axios";
import { GetStaticProps } from "next";
import Layout from "../../../components/layout";
import { useUserContext } from "../../../context/user";
import backendClient from "../../../lib/backend-client";
import { Prize } from "../../../types";

interface Props {
  prizes: Prize[];
  solanaPrice: number;
}

export default function PrizesPage({ prizes: dbPrizes, solanaPrice }: Props) {
  console.log({ dbPrizes });
  const { user } = useUserContext();
  // const [prizes, setPrizes] = useState<Prize[]>(dbPrizes);
  console.log({ user });
  const handleClaim = async (id: number) => {
    try {
      await axios.post("/api/claim-prize", { id });
      // setPrizes((prev) => {
      //   const prizeIndex = prev.findIndex((p) => p.id === id);
      //   if (prizeIndex === -1) return prev;
      //   prev[prizeIndex]!.isClaimed = true;
      //   return [...prev];
      // });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Layout>
      <Table>
        <TableCaption>A list of recent prizes.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Claim</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>USD</TableHead>
            <TableHead>User PK</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dbPrizes?.map((prize: any) => {
            const usd = (prize.amount / LAMPORTS_PER_SOL) * solanaPrice;
            const formattedCurrency = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(usd!);
            return (
              <TableRow key={prize.id}>
                <TableCell className="font-medium">
                  {user?.publicKey === prize.user.publicKey ? (
                    <Button
                      variant="default"
                      disabled={
                        user?.publicKey !== prize.user.publicKey ||
                        prize.isClaimed
                      }
                      onClick={() => handleClaim(prize.id)}
                    >
                      Claim
                    </Button>
                  ) : (
                    prize.id
                  )}
                </TableCell>
                <TableCell>{prize.amount / LAMPORTS_PER_SOL} SOL</TableCell>
                <TableCell>~{formattedCurrency}</TableCell>
                <TableCell>{prize.user.publicKey}</TableCell>
                <TableCell>{prize.isClaimed ? "Claimed" : "Pending"}</TableCell>
                <TableCell>{prize.createdAt}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as any;

  const { data: prizes } = await backendClient.get("/prize/" + id);
  console.log({ prizes });
  // const { data: solanaPrice } = await axios.get(
  //   "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  // );

  return {
    props: { prizes, solanaPrice: 108 },
    revalidate: 60,
  };
};
