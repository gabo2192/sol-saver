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
    const { data } = await backendClient.post(
      "/users/unstake",
      {
        headers: {
          Authorization: `Bearer ${token.sub}`,
        },
      }
    );
    console.log({ data });
    return res.status(200).json(data);
  } catch (e) {
    let error = e as AxiosError;
    console.log({ e: error.response?.data });
  }

  return res.status(200);
}
