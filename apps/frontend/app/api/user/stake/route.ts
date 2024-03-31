import { secret } from "@lib/auth";
import backendClient from "@lib/backend-client";
import { AxiosError } from "axios";
import jwt from "jsonwebtoken";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub)
    return NextResponse.json({}, { status: 401, statusText: "Unauthorized" });

  const payload = { id: token.sub };
  const bearerToken = jwt.sign(payload, secret);

  const body = await req.json();
  try {
    const { data } = await backendClient.post(
      "/users/stake",
      {
        txHash: body.txHash,
        amount: Number(body.amount),
        pool: Number(body.pool),
      },
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    return NextResponse.json(data);
  } catch (err) {
    let error = err as AxiosError;
    return NextResponse.json(
      {},
      {
        status: 500,
        statusText: error.response?.statusText || "Internal Server Error",
      }
    );
  }
}
