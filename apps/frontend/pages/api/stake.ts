import backendClient from "@/lib/backend-client";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
const secret = process.env.NEXTAUTH_SECRET!;

export default async function stake(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub)
    return res.send({
      error: "User wallet not authenticated",
    });
  // get cookies from request
  const { data } = await backendClient.post(
    "/users/stake",
    {
      pubkey: token.sub,
      txHash: req.body.txHash,
      amount: Number(req.body.amount),
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.AUTH_BACKEND_TOKEN}`,
      },
    }
  );
  console.log({ data });
  return res.status(200).json(data);
}
