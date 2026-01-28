import { Button } from "@/components/ui/button";
import type { StandupSummary } from "@/types/data";

interface ViewStandupSummaryProps {
	summary: StandupSummary;
	onCopy?: () => void;
}

export function ViewStandupSummary({ summary, onCopy }: ViewStandupSummaryProps) {
	const filteredProjects = summary.projects.filter(
		(project) => Array.isArray(project.tasks) && project.tasks.some(t => t.trim() !== "")
	);

	return (
		<div className="flex flex-col h-full w-full">
			{filteredProjects.length === 0 ? (
				<div className="text-muted-foreground text-sm flex-1">
					No tasks to display.
				</div>
			) : (
				<div className="bg-muted rounded p-2 text-xs overflow-x-auto max-h-full h-full flex-1">
					{filteredProjects.map((project) => (
						<div key={project.name} className="mb-4">
							<div className="font-semibold text-sm mb-1">{project.name}</div>
							<ul className="list-disc list-inside pl-4 space-y-1">
								{project.tasks.filter(t => t.trim() !== "").map((task, idx) => (
									<li key={idx} className="text-xs">{task}</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)}
			<div className="flex items-center justify-end mt-2 gap-2">
				{onCopy && (
					<Button
						size="sm"
						variant="secondary"
						onClick={onCopy}
						className="px-3"
						type="button"
					>
						Copy
					</Button>
				)}
			</div>
		</div>
	);
}
