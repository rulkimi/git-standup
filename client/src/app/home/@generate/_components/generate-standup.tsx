"use client"

import { useState } from "react";
import { useRepositories } from "@/components/providers/repositories-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isAfter, endOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { generateStandup } from "@/actions/github";
import type { StandupSummary } from "@/types/data";
import { toast } from "sonner";

function ViewStandupSummaryUI({ summary, onCopy }: { summary: StandupSummary; onCopy?: () => void }) {
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

function EditStandupSummaryUI({
  summary,
  onChange,
  onCancel,
  onSave,
  isSaving,
  onCopy,
}: {
  summary: StandupSummary;
  onChange: (newSummaryText: string) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  onCopy?: () => void;
}) {
  const [textValue, setTextValue] = useState(() => {
    return standupToText(summary);
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <Textarea
        className="flex-1 h-full"
        style={{ minHeight: "220px" }}
        value={textValue}
        onChange={handleChange}
        rows={12}
      />
      <div className="flex gap-2 mt-2">
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        {onCopy && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onCopy}
            disabled={isSaving}
            type="button"
          >
            Copy
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyResultUI() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <span className="text-muted-foreground text-xs">No standup summary yet. Generate one to see results here.</span>
    </div>
  );
}

function standupToText(summary: StandupSummary): string {
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

function textToStandupSummary(text: string): StandupSummary {
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

async function saveStandupSummary(summary: StandupSummary) {
  // Simulate a save
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { status: "success" };
}

export default function GenerateStandup() {
  const { repositories } = useRepositories();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StandupSummary | null>(null);

  // Editing-related states
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState<string>("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Copy-to-clipboard logic
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Summary copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setResult(null);
    setEditing(false);
    setEditText("");
    setSaveError(null);

    if (!startDate || !endDate || !repositories || repositories.length === 0) {
      setError("Please select start and end date and ensure at least one repository.");
      return;
    }

    setLoading(true);

    try {
      const response = await generateStandup({
        repo_names: repositories,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        extra_info: info,
      });
      if (response.status === "success" && response.data) {
        setResult(response.data);
        toast.success("Standup summary generated successfully.");
      } else {
        setError(response.message || "Failed to generate standup.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (result) {
      setEditText(standupToText(result));
      setSaveError(null);
      setEditing(true);
    }
  };

  const handleEditChange = (newEditText: string) => {
    setEditText(newEditText);
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setSaveError(null);
    // Optionally reset editText to original summary
    if (result) {
      setEditText(standupToText(result));
    }
  };

  const handleSaveSummary = async () => {
    setSaveError(null);
    setSaveLoading(true);
    try {
      const updatedSummary = textToStandupSummary(editText);
      const resp = await saveStandupSummary(updatedSummary);
      if (resp.status === "success") {
        setResult(updatedSummary);
        toast.success("Summary saved!");
        setEditing(false);
      } else {
        setSaveError("Failed to save summary.");
      }
    } catch (e) {
      setSaveError("Failed to save summary.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Disable all future dates
  const maxSelectableDate = endOfToday();

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6",
        "w-full",
        "h-[70dvh]" // Ensures the grid is at least this height
      )}
      style={{ minHeight: "min(400px, 60dvh)" }} // fallback for old browsers
    >
      {/* LEFT: Inputs */}
      <div className="border rounded-md bg-background p-4 flex flex-col gap-4 h-full">
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
          onClick={handleGenerate}
          className="self-start px-4 py-2"
          disabled={!startDate || !endDate || loading}
        >
          {loading ? "Generating..." : "Generate"}
        </Button>
        {error && (
          <div className="text-red-500 text-xs mt-1">{error}</div>
        )}
      </div>
      {/* RIGHT: Standup Result */}
      <div className="border rounded-md bg-background p-4 min-h-[160px] flex flex-col h-full">
        {!result ? (
          <EmptyResultUI />
        ) : !editing ? (
          <>
            <ViewStandupSummaryUI
              summary={result}
              onCopy={() => handleCopy(standupToText(result))}
            />
            <div className="mt-2 flex flex-col items-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditClick}
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
          <EditStandupSummaryUI
            summary={result}
            onChange={handleEditChange}
            onCancel={handleCancelEdit}
            onSave={handleSaveSummary}
            isSaving={saveLoading}
            onCopy={() => handleCopy(editText)}
          />
        )}
      </div>
    </div>
  );
}