from typing import Optional
import requests

def get_headers(github_token: str):
  return {
    "Authorization": f"token {github_token}",
    "Accept": "application/vnd.github.v3+json"
  }

def get_repositories_list(github_token: str, organization: Optional[str] = None):
  headers = get_headers(github_token)

  repos = []
  page = 1
  per_page = 100

  if organization is not None:
    url = f"https://api.github.com/orgs/{organization}/repos"
  else:
    url = "https://api.github.com/user/repos"

  params = {"per_page": per_page, "page": page, "type": "all"}

  while True:
    response = requests.get(url, headers=headers, params=params)
    try:
      response.raise_for_status()
    except requests.exceptions.HTTPError:
      return []
    data = response.json()
    if not data:
      break
    for r in data:
      repo_info = {
        "name": r.get("name"),
        "owner": r.get("owner", {}).get("login"),
        "private": r.get("private"),
        "full_name": r.get("full_name"),
        "html_url": r.get("html_url"),
        "description": r.get("description"),
        "stargazers_count": r.get("stargazers_count"),
        "language": r.get("language"),
      }
      repos.append(repo_info)
    if len(data) < per_page:
      break
    params["page"] += 1

  return repos

def get_branches_list(github_token: str, repo_name: str):
  headers = get_headers(github_token)
  url = f"https://api.github.com/repos/{repo_name}/branches"

  branches = []
  page = 1
  per_page = 100

  while True:
    params = {"per_page": per_page, "page": page}
    response = requests.get(url, headers=headers, params=params)
    try:
      response.raise_for_status()
    except requests.exceptions.HTTPError:
      return []
    data = response.json()
    if not data:
      break
    for branch in data:
      branches.append({
        "name": branch.get("name"),
        "protected": branch.get("protected"),
        "commit_sha": branch.get("commit", {}).get("sha")
      })
    if len(data) < per_page:
      break
    page += 1

  return branches

def fetch_commits(
  github_token: str,
  repo_name: str,
  start_iso: str,
  end_iso: str,
  author: str,
  organization: str = None
):
  headers = get_headers(github_token)
  if organization:
    url = f"https://api.github.com/repos/{organization}/{repo_name}/commits"
  else:
    url = f"https://api.github.com/repos/{author}/{repo_name}/commits"
  commits = []
  page = 1
  per_page = 100

  while True:
    params = {
      "since": start_iso,
      "until": end_iso,
      "per_page": per_page,
      "page": page
    }
    if author:
      params["author"] = author

    response = requests.get(url, headers=headers, params=params)
    try:
      response.raise_for_status()
    except requests.exceptions.HTTPError:
      if response.status_code == 404:
        return []
      return []
    data = response.json()
    if not data:
      break
    for c in data:
      commits.append({
        "sha": c.get("sha"),
        "author": (c.get("author") or {}).get("login"),
        "commit_message": (c.get("commit") or {}).get("message"),
        "date": (c.get("commit") or {}).get("committer", {}).get("date"),
        "html_url": c.get("html_url"),
      })
    if len(data) < per_page:
      break
    page += 1

  return commits