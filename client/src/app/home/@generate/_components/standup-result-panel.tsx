"use client"

import { Button } from "@/components/ui/button";
import { EditStandupSummary } from "./generate-standup/edit-standup-summary";
import { EmptyResult } from "./generate-standup/empty-result";
import { useStandup } from "./generate-standup/standup-context";
import { ViewStandupSummary } from "./generate-standup/view-standup-summary";
import { standupToText } from "./generate-standup/standup-utils";

export function StandupResultPanel() {
	const {
		result,
		editing,
		editText,
		saveLoading,
		saveError,
		startEdit,
		updateEditText,
		cancelEdit,
		saveSummary,
		copyToClipboard,
	} = useStandup();

	return (
		<div className="border rounded-md bg-background p-4 min-h-[160px] flex flex-col h-full">
			{!result ? (
				<EmptyResult />
			) : !editing ? (
				<>
					<ViewStandupSummary
						summary={result}
						onCopy={() => copyToClipboard(standupToText(result))}
					/>
					<div className="mt-2 flex flex-col items-end gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={startEdit}
							className="px-3"
						>
							Click to edit
						</Button>
						{saveError && (
							<div className="text-red-500 text-xs">{saveError}</div>
						)}
					</div>
				</>
			) : (
				<EditStandupSummary
					onCopy={() => copyToClipboard(editText)}
				/>
			)}
		</div>
	);
}
