import type { StandupSummary } from "@/types/data";

export function standupToText(summary: StandupSummary): string {
	return summary.projects
		.filter((p) => Array.isArray(p.tasks) && p.tasks.some(t => t.trim() !== ""))
		.map(
			(project) =>
				`${project.name}\n${project.tasks
					.filter((t) => t.trim() !== "")
					.map((task) => `- ${task}`)
					.join("\n")}`
		)
		.join("\n\n");
}

export function textToStandupSummary(text: string): StandupSummary {
	const projects: { name: string; tasks: string[] }[] = [];
	const lines = text.split("\n").map(l => l.trimEnd());
	let currentProject: { name: string; tasks: string[] } | null = null;

	for (let i = 0; i < lines.length; ++i) {
		const line = lines[i];
		if (line.trim() === "") {
			if (currentProject) {
				if (currentProject.tasks.length > 0) {
					projects.push(currentProject);
				}
				currentProject = null;
			}
			continue;
		}
		if (!line.startsWith("-")) {
			if (currentProject && currentProject.tasks.length > 0) {
				projects.push(currentProject);
			}
			currentProject = { name: line, tasks: [] };
		} else if (currentProject) {
			const task = line.replace(/^- */, "");
			if (task.trim() !== "") {
				currentProject.tasks.push(task);
			}
		}
	}
	if (currentProject && currentProject.tasks.length > 0) {
		projects.push(currentProject);
	}
	return { projects };
}

export async function saveStandupSummary(summary: StandupSummary) {
	// Simulate a save
	await new Promise((resolve) => setTimeout(resolve, 500));
	return { status: "success" };
}
