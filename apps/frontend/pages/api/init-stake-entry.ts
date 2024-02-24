import { AxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import backendClient from "../../lib/backend-client";
const secret = process.env.NEXTAUTH_SECRET!;

export default async function stake(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub)
    return res.send({
      error: "User wallet not authenticated",
    });
  // get cookies from request
  try {
    await backendClient.post(
      "/users/init-stake-entry",
      {
        pubkey: token.sub,
        txHash: req.body.txHash,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AUTH_BACKEND_TOKEN}`,
        },
      }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    let error = err as AxiosError;
    console.log({ error: error });
    return res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
}
