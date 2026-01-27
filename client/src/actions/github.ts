
"use server"

import { Repository, StandupSummary } from "@/types/data";
import { getAccessToken, getSession } from "./token";

interface ApiResponse<T> {
  data?: T;
  status: "success" | "error";
  message: string;
}

type RepositoryListResponse = ApiResponse<Repository[]>;

export async function fetchRepositoryList(): Promise<RepositoryListResponse> {
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

interface StandupValues {
  repo_names: string[];
  // author: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  organization?: string;
  extra_info?: string;
}

type StandupResponse = ApiResponse<StandupSummary>;

export async function generateStandup(
  values: StandupValues
): Promise<StandupResponse> {
  const session = await getSession();
  const token = session?.accessToken;

  // Only repo_names in the body; all else in query params
  const payload = {
    repo_names: values.repo_names
  };

  const queryParams = new URLSearchParams();

  if (token) queryParams.append("github_token", token);
  if (session?.user?.name) queryParams.append("author", session.user.name);
  if (values.start_date) queryParams.append("start_date", values.start_date);
  if (values.end_date) queryParams.append("end_date", values.end_date);
  if (values.organization) queryParams.append("organization", values.organization);
  if (values.extra_info) queryParams.append("extra_info", values.extra_info);

  const url = `${process.env.API_URL}/commits/summary/by-repos?${queryParams}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (
      data &&
      data.status === "success" &&
      data.data &&
      Array.isArray(data.data.projects)
    ) {
      return {
        data: {
          projects: data.data.projects
        },
        status: "success",
        message: data.message || "Standup generated successfully.",
      };
    } else {
      return {
        data: undefined,
        status: "error",
        message: data?.message || "Failed to generate standup.",
      };
    }
  } catch {
    return {
      data: undefined,
      status: "error",
      message: "An unexpected error occured generating standup."
    };
  }
}