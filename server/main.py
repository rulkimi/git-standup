from typing import Optional, Any, List, Dict, Union
from fastapi import FastAPI, Body, Query
from pydantic import BaseModel
from app.github_client import get_repositories_list, fetch_commits
from datetime import datetime, timedelta, timezone
from app.gemini_client import get_ai_response

app = FastAPI()

class APIResponse(BaseModel):
  data: Optional[Any] = None
  status: str = "success"
  message: str = ""
  error: Optional[Union[str, Dict]] = None

@app.get("/repos", response_model=APIResponse)
def get_repositories(
  github_token: str,
  organization: Optional[str] = None
):
  try:
    repos = get_repositories_list(github_token, organization)
    return APIResponse(
      data={"repositories": repos},
      status="success",
      message="Repositories fetched successfully."
    )
  except Exception as e:
    return APIResponse(
      data=None,
      status="fail",
      message="Failed to fetch repositories.",
      error=str(e)
    )

@app.get("/commits/today", response_model=APIResponse)
def get_commits_of_today(
  github_token: str,
  repo_name: str,
  author: str,
  organization: Optional[str] = None
):
  try:
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    start_iso = start_of_day.isoformat()
    end_iso = end_of_day.isoformat()
    commits = fetch_commits(
      github_token=github_token,
      repo_name=repo_name,
      start_iso=start_iso,
      end_iso=end_iso,
      author=author,
      organization=organization
    )
    return APIResponse(
      data={"commits": commits},
      status="success",
      message="Today's commits fetched successfully."
    )
  except Exception as e:
    return APIResponse(
      data=None,
      status="fail",
      message="Failed to fetch today's commits.",
      error=str(e)
    )

@app.get("/commits/by-date", response_model=APIResponse)
def get_commits_by_date(
  github_token: str,
  repo_name: str,
  author: str,
  start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
  end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
  organization: Optional[str] = None
):
  try:
    # Parse start_date and end_date
    start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc)
    if end_dt < start_dt:
      return APIResponse(
        data=None,
        status="fail",
        message="end_date cannot be before start_date.",
        error="end_date cannot be before start_date."
      )
    start_iso = start_dt.isoformat()
    end_iso = end_dt.isoformat()
    commits = fetch_commits(
      github_token=github_token,
      repo_name=repo_name,
      start_iso=start_iso,
      end_iso=end_iso,
      author=author,
      organization=organization
    )
    return APIResponse(
      data={"commits": commits},
      status="success",
      message="Commits fetched successfully for given date range."
    )
  except ValueError:
    err_msg = "Invalid date format. Use YYYY-MM-DD."
    return APIResponse(
      data=None,
      status="fail",
      message=err_msg,
      error=err_msg
    )
  except Exception as e:
    return APIResponse(
      data=None,
      status="fail",
      message="Failed to fetch commits by date.",
      error=str(e)
    )

@app.post("/commits/from-repos", response_model=APIResponse)
def get_commits_from_multiple_repos(
  github_token: str,
  repo_names: List[str],
  author: str,
  start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
  end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
  organization: Optional[str] = None
):
  try:
    start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc)
    if end_dt < start_dt:
      return APIResponse(
        data=None,
        status="fail",
        message="end_date cannot be before start_date.",
        error="end_date cannot be before start_date."
      )
    start_iso = start_dt.isoformat()
    end_iso = end_dt.isoformat()
    all_commits = []
    for repo_name in repo_names:
      commits = fetch_commits(
        github_token=github_token,
        repo_name=repo_name,
        start_iso=start_iso,
        end_iso=end_iso,
        author=author,
        organization=organization
      )
      all_commits.append({
        "repo_name": repo_name,
        "commits": commits
      })
    return APIResponse(
      data={"repositories": all_commits},
      status="success",
      message="Commits from multiple repositories fetched successfully."
    )
  except ValueError:
    err_msg = "Invalid date format. Use YYYY-MM-DD."
    return APIResponse(
      data=None,
      status="fail",
      message=err_msg,
      error=err_msg
    )
  except Exception as e:
    return APIResponse(
      data=None,
      status="fail",
      message="Failed to fetch commits from multiple repositories.",
      error=str(e)
    )

@app.post("/commits/summary/by-repos", response_model=APIResponse)
def summarize_commits_from_repos(
  github_token: str,
  repo_names: List[str],
  author: str,
  start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
  end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
  organization: Optional[str] = None,
  extra_info: Optional[str] = Body(None, description="Any extra information or context to add to the standup prompt")
):
  try:
    start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
    end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc)
    if end_dt < start_dt:
      return APIResponse(
        data=None,
        status="fail",
        message="end_date cannot be before start_date.",
        error="end_date cannot be before start_date."
      )
    start_iso = start_dt.isoformat()
    end_iso = end_dt.isoformat()

    # Gather all commits per repo
    projects = []
    for repo_name in repo_names:
      commits = fetch_commits(
        github_token=github_token,
        repo_name=repo_name,
        start_iso=start_iso,
        end_iso=end_iso,
        author=author,
        organization=organization
      )
      commit_messages = [commit["commit_message"] for commit in commits if commit.get("commit_message")]
      projects.append({
        "repo_name": repo_name,
        "commit_messages": commit_messages
      })

    # Build prompt for Gemini (standup style)
    prompt_projects = []
    for project in projects:
      prompt_projects.append(
        f"Project: {project['repo_name']}\n" +
        "Commit messages:\n" +
        "\n".join(f"- {msg}" for msg in project["commit_messages"])
      )
    base_prompt = (
      "You are helping to write a standup summary. For each project below, read the commit messages and combine related work into a concise summary suitable for a standup meeting, using natural language rather than just a list. If several commits are related, feel free to combine them into a single summarized task. Reply with a JSON containing each project and, for each, a list of concise standup-style sentences that capture the work completed.\n"
      "Your output must comply with this schema:\n\n"
      '{ "projects": [ { "name": "project_name", "tasks": ["Standup-style summary sentence 1", "Summary sentence 2", ...] }, ... ] }\n\n'
      "Here are the projects and their commit messages:\n"
      f"{chr(10).join(prompt_projects)}"
    )

    # Add user provided info to the prompt if any
    if extra_info:
      prompt = (
        f"{base_prompt}\n\nAdditional user-provided information (incorporate or consider in the standup summary as relevant):\n{extra_info}\n"
      )
    else:
      prompt = base_prompt

    summary = get_ai_response(prompt)
    return APIResponse(
      data=summary,
      status="success",
      message="Commit summary generated successfully."
    )
  except ValueError:
    err_msg = "Invalid date format. Use YYYY-MM-DD."
    return APIResponse(
      data=None,
      status="fail",
      message=err_msg,
      error=err_msg
    )
  except Exception as e:
    return APIResponse(
      data=None,
      status="fail",
      message="Failed to get summary from Gemini.",
      error=str(e)
    )