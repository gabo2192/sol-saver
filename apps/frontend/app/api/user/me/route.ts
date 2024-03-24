import { secret } from "@lib/auth";
import backendClient from "@lib/backend-client";
import { User } from "@types";
import jwt from "jsonwebtoken";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });
  if (!token || !token.sub)
    return NextResponse.json({}, { status: 401, statusText: "Unauthorized" });
  const payload = { id: token.sub };
  const bearerToken = jwt.sign(payload, secret);

  const { data } = await backendClient.get<User>("/users/", {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });
  return NextResponse.json(data);
}
