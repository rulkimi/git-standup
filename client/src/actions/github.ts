
"use server"

import { Repository } from "@/types/data";
import getAccessToken from "./token";

interface ApiResponse<T> {
  data?: T;
  status: "success" | "error";
  message: string;
}

type RepositoryListResponse = ApiResponse<Repository[]>;

export default async function fetchRepositoryList(): Promise<RepositoryListResponse> {
  const token = await getAccessToken();
  const url = `${process.env.API_URL}/repos?github_token=${token}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      ...data,
      data: data.data.repositories
    };
  } catch {
    return {
      data: undefined,
      status: "error",
      message: "An unexpected error occured."
    };
  }
}

