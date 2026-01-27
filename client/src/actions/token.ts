
"use server"

import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";

export default async function getAccessToken() {
  const session = await getServerSession(authOptions);
  return session?.accessToken;
}
