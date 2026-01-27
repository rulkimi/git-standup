"use client"

import { useRepositories } from "@/components/providers/repositories-provider"

export default function HomePage() {
  const { repositories } = useRepositories();

  return (
    <div>{repositories.map(repo => <div key={repo}>{repo}</div>)}</div>
  )
}