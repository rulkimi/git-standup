"use client"

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isAfter, endOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useStandup } from "./standup-context";

export function DateRangePicker() {
	const {
		startDate,
		endDate,
		startCalendarOpen,
		endCalendarOpen,
		setStartDate,
		setEndDate,
		setStartCalendarOpen,
		setEndCalendarOpen,
	} = useStandup();

	const maxSelectableDate = endOfToday();

	return (
		<div className="flex flex-col gap-2">
			<label className="text-xs text-muted-foreground font-semibold uppercase">
				Start and End Date
			</label>
			<div className="flex gap-2 min-w-0">
				{/* Start Date Picker */}
				<div className="flex-1 min-w-0">
					<Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal truncate",
									!startDate && "text-muted-foreground"
								)}
								type="button"
							>
								<span className="truncate block w-full">
									{startDate ? format(startDate, "yyyy-MM-dd") : "Start date"}
								</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={startDate}
								onSelect={date => {
									if (date && !isAfter(date, maxSelectableDate)) {
										setStartDate(date);
										setStartCalendarOpen(false);
									}
								}}
								disabled={date => isAfter(date, maxSelectableDate)}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<span className="self-center text-muted-foreground shrink-0">→</span>
				{/* End Date Picker */}
				<div className="flex-1 min-w-0">
					<Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal truncate",
									!endDate && "text-muted-foreground"
								)}
								type="button"
							>
								<span className="truncate block w-full">
									{endDate ? format(endDate, "yyyy-MM-dd") : "End date"}
								</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={endDate}
								onSelect={date => {
									if (date && !isAfter(date, maxSelectableDate)) {
										setEndDate(date);
										setEndCalendarOpen(false);
									}
								}}
								disabled={date => isAfter(date, maxSelectableDate)}
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</div>
	);
}
