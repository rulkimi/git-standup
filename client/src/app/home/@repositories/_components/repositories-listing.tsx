"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Repository } from "@/types/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRepositories } from "@/components/providers/repositories-provider";

interface RepositoriesListingProps {
  repositories: Repository[];
}

const SHOW_SEARCH_THRESHOLD = 5; 

export default function RepositoriesListing({ repositories }: RepositoriesListingProps) {
  // Use the global repositories context so it syncs with the provider/localStorage
  const { repositories: selectedRepos, setRepositories } = useRepositories();

  const [search, setSearch] = useState("");

  // Sync checkedRepo state with the global context, and update whenever selectedRepos changes
  const [checkedRepos, setCheckedRepos] = useState<string[]>(selectedRepos);

  useEffect(() => {
    setCheckedRepos(selectedRepos);
  }, [selectedRepos]);

  const filteredRepos = useMemo(() => {
    if (!search) return repositories;
    const lower = search.toLowerCase();
    return repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(lower) ||
        (repo.description?.toLowerCase().includes(lower) ?? false) ||
        repo.owner.toLowerCase().includes(lower) ||
        (repo.language && repo.language.toLowerCase().includes(lower))
    );
  }, [repositories, search]);

  // Allow checking/unchecking multiple repos, and sync to context/localStorage
  const handleCheckboxChange = (repoName: string) => {
    let newChecked: string[];
    if (checkedRepos.includes(repoName)) {
      newChecked = checkedRepos.filter((name) => name !== repoName);
    } else {
      newChecked = [...checkedRepos, repoName];
    }
    setCheckedRepos(newChecked);
    setRepositories(newChecked);
  };

  return (
    <div className="flex flex-col gap-4">
      {repositories.length > SHOW_SEARCH_THRESHOLD && (
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repositories..."
          className="shadow-none"
        />
      )}
      <ul className="flex flex-col gap-1">
        <ScrollArea className="max-h-[80dvh]">
          {filteredRepos.length === 0 ? (
            <li className="py-6 text-center text-muted-foreground text-sm">
              No repositories found
              {!!search && <> for &quot;{search}&quot;.</>}
            </li>
          ) : (
            filteredRepos.map((repo) => (
              <li
                key={repo.html_url}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted transition-all"
                style={{ boxShadow: "none" }}
              >
                <Checkbox
                  id={`repo-${repo.name}`}
                  checked={checkedRepos.includes(repo.name)}
                  onCheckedChange={() => handleCheckboxChange(repo.name)}
                />
                <label
                  htmlFor={`repo-${repo.name}`}
                  className="flex-1 flex items-center gap-1 cursor-pointer select-none"
                >
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-medium"
                  >
                    {repo.name}
                  </a>
                  <span className="text-xs text-muted-foreground">/ {repo.owner}</span>
                  {repo.forked_from && (
                    <Badge variant="secondary" className="text-xs px-1 py-0.5">
                      Forked
                    </Badge>
                  )}
                  {repo.language && (
                    <Badge
                      variant="outline"
                      className="capitalize text-xs px-1 py-0.5"
                    >
                      {repo.language}
                    </Badge>
                  )}
                </label>
              </li>
            ))
          )}
        </ScrollArea>
      </ul>
    </div>
  );
}