import getRepositoriesList from "@/actions/github"

export default async function ReposPage() {
  const result = await getRepositoriesList();
  console.log(result)
  return (
    <div></div>
  )
}