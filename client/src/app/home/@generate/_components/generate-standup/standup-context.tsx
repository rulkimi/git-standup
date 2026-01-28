"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { useRepositories } from "@/components/providers/repositories-provider";
import { format, endOfToday } from "date-fns";
import { generateStandup } from "@/actions/github";
import type { StandupSummary } from "@/types/data";
import { toast } from "sonner";
import { standupToText, textToStandupSummary, saveStandupSummary } from "./standup-utils";

interface StandupState {
	// Input state
	startDate: Date | undefined;
	endDate: Date | undefined;
	startCalendarOpen: boolean;
	endCalendarOpen: boolean;
	info: string;

	// Generation state
	loading: boolean;
	error: string | null;

	// Result state
	result: StandupSummary | null;

	// Edit state
	editing: boolean;
	editText: string;
	saveLoading: boolean;
	saveError: string | null;
}

interface StandupContextValue extends StandupState {
	// Date actions
	setStartDate: (date: Date | undefined) => void;
	setEndDate: (date: Date | undefined) => void;
	setStartCalendarOpen: (open: boolean) => void;
	setEndCalendarOpen: (open: boolean) => void;
	setInfo: (value: string) => void;

	// Generation actions
	generate: () => Promise<void>;

	// Edit actions
	startEdit: () => void;
	cancelEdit: () => void;
	updateEditText: (text: string) => void;
	saveSummary: () => Promise<void>;

	// Utility actions
	copyToClipboard: (text: string) => Promise<void>;
}

const StandupContext = createContext<StandupContextValue | undefined>(undefined);

export function StandupProvider({ children }: { children: ReactNode }) {
	const { repositories } = useRepositories();
	const today = endOfToday();

	const [state, setState] = useState<StandupState>({
		startDate: today,
		endDate: today,
		startCalendarOpen: false,
		endCalendarOpen: false,
		info: "",
		loading: false,
		error: null,
		result: null,
		editing: false,
		editText: "",
		saveLoading: false,
		saveError: null,
	});

	const stateRef = useRef(state);
	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	const setStartDate = useCallback((date: Date | undefined) => {
		setState(prev => ({ ...prev, startDate: date }));
	}, []);

	const setEndDate = useCallback((date: Date | undefined) => {
		setState(prev => ({ ...prev, endDate: date }));
	}, []);

	const setStartCalendarOpen = useCallback((open: boolean) => {
		setState(prev => ({ ...prev, startCalendarOpen: open }));
	}, []);

	const setEndCalendarOpen = useCallback((open: boolean) => {
		setState(prev => ({ ...prev, endCalendarOpen: open }));
	}, []);

	const setInfo = useCallback((value: string) => {
		setState(prev => ({ ...prev, info: value }));
	}, []);

	const generate = useCallback(async () => {
		if (!state.startDate || !state.endDate || !repositories || repositories.length === 0) {
			setState(prev => ({ ...prev, error: "Please select start and end date and ensure at least one repository." }));
			return;
		}

		setState(prev => ({
			...prev,
			error: null,
			result: null,
			editing: false,
			editText: "",
			saveError: null,
			loading: true,
		}));

		try {
			const response = await generateStandup({
				repo_names: repositories,
				start_date: format(state.startDate, "yyyy-MM-dd"),
				end_date: format(state.endDate, "yyyy-MM-dd"),
				extra_info: state.info,
			});

			if (response.status === "success" && response.data) {
				setState(prev => ({
					...prev,
					result: response.data ?? null,
					loading: false,
				}));
				toast.success("Standup summary generated successfully.");
			} else {
				setState(prev => ({
					...prev,
					error: response.message || "Failed to generate standup.",
					loading: false,
				}));
			}
		} catch {
			setState(prev => ({
				...prev,
				error: "An unexpected error occurred.",
				loading: false,
			}));
		}
	}, [state.startDate, state.endDate, state.info, repositories]);

	const startEdit = useCallback(() => {
		if (state.result) {
			setState(prev => ({
				...prev,
				editText: standupToText(prev.result!),
				saveError: null,
				editing: true,
			}));
		}
	}, [state.result]);

	const cancelEdit = useCallback(() => {
		setState(prev => ({
			...prev,
			editing: false,
			saveError: null,
			editText: prev.result ? standupToText(prev.result) : "",
		}));
	}, []);

	const updateEditText = useCallback((text: string) => {
		setState(prev => ({ ...prev, editText: text, saveError: null }));
	}, []);

	const saveSummary = useCallback(async () => {
		setState(prev => ({ ...prev, saveError: null, saveLoading: true }));

		const currentEditText = stateRef.current.editText;

		try {
			const updatedSummary = textToStandupSummary(currentEditText);
			const resp = await saveStandupSummary(updatedSummary);

			if (resp.status === "success") {
				setState(prev => ({
					...prev,
					result: updatedSummary,
					editing: false,
					saveLoading: false,
				}));
				toast.success("Summary saved!");
			} else {
				setState(prev => ({
					...prev,
					saveError: "Failed to save summary.",
					saveLoading: false,
				}));
			}
		} catch {
			setState(prev => ({
				...prev,
				saveError: "Failed to save summary.",
				saveLoading: false,
			}));
		}
	}, []);

	const copyToClipboard = useCallback(async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Summary copied to clipboard!");
		} catch {
			toast.error("Failed to copy to clipboard.");
		}
	}, []);

	const value: StandupContextValue = {
		...state,
		setStartDate,
		setEndDate,
		setStartCalendarOpen,
		setEndCalendarOpen,
		setInfo,
		generate,
		startEdit,
		cancelEdit,
		updateEditText,
		saveSummary,
		copyToClipboard,
	};

	return <StandupContext.Provider value={value}>{children}</StandupContext.Provider>;
}

export function useStandup() {
	const context = useContext(StandupContext);
	if (context === undefined) {
		throw new Error("useStandup must be used within StandupProvider");
	}
	return context;
}
