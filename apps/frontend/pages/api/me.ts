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
  const { data } = await backendClient.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token.sub}`,
    },
  });
  return res.status(200).json(data);
}
