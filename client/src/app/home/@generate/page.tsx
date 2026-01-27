import GenerateStandup from "./_components/generate-standup";
import SelectedRepositories from "./_components/selected-repositories";

export default function GenerateSection() {

  return (
    <div className="space-y-4">
      <SelectedRepositories />
      <GenerateStandup />
    </div>
  )
}