"use client"

import { cn } from "@/lib/utils";
import { StandupProvider } from "./standup-context";
import { StandupInputForm } from "./standup-input-form";
import { StandupResultPanel } from "./standup-result-panel";

export default function GenerateStandup() {
	return (
		<StandupProvider>
			<div
				className={cn(
					"grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6",
					"w-full",
				)}
			>
				<StandupInputForm />
				<StandupResultPanel />
			</div>
		</StandupProvider>
	);
}