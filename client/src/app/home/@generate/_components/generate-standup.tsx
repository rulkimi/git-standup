"use client"

import { useState } from "react";
import { useRepositories } from "@/components/providers/repositories-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isAfter, endOfToday } from "date-fns";
import { cn } from "@/lib/utils";

export default function GenerateStandup() {
  const { repositories } = useRepositories();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [info, setInfo] = useState("");

  const handleGenerate = () => {
    console.log("Generating standup for:", {
      repositories,
      start_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      info,
    });
  };

  // Disable all future dates
  const maxSelectableDate = endOfToday();

  return (
    <div className="p-4 rounded-md border bg-background flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase">
          Start and End Date
        </label>
        <div className="flex gap-2">
          {/* Start Date Picker */}
          <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[130px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
                type="button"
              >
                {startDate ? format(startDate, "yyyy-MM-dd") : <span>Start date</span>}
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
                initialFocus
                toDate={maxSelectableDate}
              />
            </PopoverContent>
          </Popover>
          <span className="self-center text-muted-foreground">→</span>
          {/* End Date Picker */}
          <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[130px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
                type="button"
              >
                {endDate ? format(endDate, "yyyy-MM-dd") : <span>End date</span>}
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
                initialFocus
                toDate={maxSelectableDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-muted-foreground font-semibold uppercase" htmlFor="standup-info">
          Additional information
        </label>
        <Textarea
          id="standup-info"
          value={info}
          onChange={e => setInfo(e.target.value)}
          className="min-h-[60px]"
          placeholder="Any extra details for your standup..."
        />
      </div>
      <Button
        onClick={handleGenerate}
        className="self-start px-4 py-2"
        disabled={!startDate || !endDate}
      >
        Generate
      </Button>
    </div>
  );
}