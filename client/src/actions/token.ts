
"use server"

import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";

export async function getAccessToken() {
  const session = await getServerSession(authOptions);
  return session?.accessToken;
}

export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

