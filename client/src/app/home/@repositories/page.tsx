import { fetchRepositoryList } from "@/actions/github";
import type { Repository } from "@/types/data";
import RepositoriesListing from "./_components/repositories-listing";

export default async function RepositoriesSection() {
  const result = await fetchRepositoryList();
  const repositories: Repository[] = result.data ?? [];

  return (
    <div className="flex flex-col gap-2">
      {repositories.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground text-sm">No repositories found.</div>
      ) : (
        <RepositoriesListing repositories={repositories} />
      )}
    </div>
  );
}