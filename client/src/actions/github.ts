
"use server"

import getAccessToken from "./token";

export default async function getRepositoriesList() {
  const token = await getAccessToken();
  const url = `${process.env.API_URL}/repos?github_token=${token}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch {

  }
}

