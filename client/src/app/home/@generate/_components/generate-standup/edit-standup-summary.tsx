"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStandup } from "./standup-context";

interface EditStandupSummaryProps {
	onCopy?: () => void;
}

export function EditStandupSummary({ onCopy }: EditStandupSummaryProps) {
	const {
		editText,
		saveLoading,
		updateEditText,
		cancelEdit,
		saveSummary,
	} = useStandup();

	return (
		<div className="flex flex-col gap-2 h-full">
			<Textarea
				className="flex-1 h-full"
				style={{ minHeight: "220px" }}
				value={editText}
				onChange={e => updateEditText(e.target.value)}
				rows={12}
			/>
			<div className="flex gap-2 mt-2">
				<Button size="sm" onClick={saveSummary} disabled={saveLoading}>
					{saveLoading ? "Saving..." : "Save"}
				</Button>
				<Button size="sm" variant="outline" onClick={cancelEdit} disabled={saveLoading}>
					Cancel
				</Button>
				{onCopy && (
					<Button
						size="sm"
						variant="secondary"
						onClick={onCopy}
						disabled={saveLoading}
						type="button"
					>
						Copy
					</Button>
				)}
			</div>
		</div>
	);
}
