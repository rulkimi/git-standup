"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DateRangePicker } from "./date-range-picker";
import { useStandup } from "./standup-context";

export function StandupInputForm() {
	const {
		info,
		loading,
		error,
		setInfo,
		generate,
		startDate,
		endDate,
	} = useStandup();

	return (
		<div className="border rounded-md bg-background p-4 flex flex-col gap-4 h-fit">
			<DateRangePicker />
			<div className="flex flex-col gap-2">
				<label className="text-xs text-muted-foreground font-semibold uppercase" htmlFor="standup-info">
					Additional information
				</label>
				<Textarea
					id="standup-info"
					value={info}
					onChange={e => setInfo(e.target.value)}
					className="min-h-[130px]"
					rows={20}
					placeholder="Any extra details for your standup..."
				/>
			</div>
			<Button
				onClick={generate}
				className="self-start px-4 py-2 w-full"
				disabled={!startDate || !endDate || loading}
			>
				{loading ? "Generating..." : "Generate"}
			</Button>
			{error && (
				<div className="text-red-500 text-xs mt-1">{error}</div>
			)}
		</div>
	);
}
