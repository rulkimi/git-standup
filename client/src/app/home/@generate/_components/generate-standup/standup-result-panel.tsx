"use client"

import { Button } from "@/components/ui/button";
import { ViewStandupSummary } from "./view-standup-summary";
import { EditStandupSummary } from "./edit-standup-summary";
import { EmptyResult } from "./empty-result";
import { useStandup } from "./standup-context";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

// Loading steps and timings for a smoother, more informative UX
const LOADING_STEPS = [
	{ key: "fetching-commits", text: "Looking through your repo and branches for commits..." },
	{ key: "commits-fetched", text: "Commits fetched!" },
	{ key: "analyzing", text: "Analyzing with AI for summary..." },
];
// Define durations for each step (in ms)
const STEP_DURATIONS = [2000, 1800, 2600];

// The main reason the animation appears to shift right is the use of absolute positioning with width: 100% on the message span.
// By changing the parent `relative` container to `flex justify-center` with minWidth, and using normal (non-absolute) positioning for the spanning element and letting AnimatePresence/motion span animate y/opacity only, we avoid text jumpiness.

function LoadingStatusMessages({ loading }: { loading: boolean }) {
	const [step, setStep] = useState(0);
	const timersRef = useRef<number[]>([]);

	// We want to always *run* through the steps in order, and reset only when loading starts anew
	useEffect(() => {
		if (!loading) return;

		let active = true;
		setStep(0);

		timersRef.current.forEach(clearTimeout);
		timersRef.current = [];

		const goToStep = (nextStep: number) => {
			if (!active) return;
			setStep(nextStep);
			if (nextStep < LOADING_STEPS.length - 1) {
				const timer = window.setTimeout(() => goToStep(nextStep + 1), STEP_DURATIONS[nextStep]);
				timersRef.current.push(timer);
			}
		};

		const firstTimer = window.setTimeout(() => goToStep(1), STEP_DURATIONS[0]);
		timersRef.current.push(firstTimer);

		return () => {
			active = false;
			timersRef.current.forEach(clearTimeout);
			timersRef.current = [];
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading]);

	// If loading ends, reset state
	useEffect(() => {
		if (!loading) {
			setStep(0);
			timersRef.current.forEach(clearTimeout);
			timersRef.current = [];
		}
	}, [loading]);

	return (
		<div className="flex flex-col gap-4 items-center justify-center flex-1 py-12">
			<Spinner className="mb-1" />
			<div
				className="text-sm font-medium text-muted-foreground animate-pulse text-center flex justify-center min-h-[28px]"
				style={{ minHeight: 28, minWidth: 180 }} // minWidth good for layout stability
			>
				<AnimatePresence mode="wait" initial={false}>
					<motion.span
						key={LOADING_STEPS[step]?.key}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.25 }}
						className="w-full"
						// No absolute position! No width: 100% style!
					>
						{LOADING_STEPS[step]?.text}
					</motion.span>
				</AnimatePresence>
			</div>
		</div>
	);
}

export function StandupResultPanel() {
	const {
		result,
		editing,
		editText,
		saveError,
		startEdit,
		copyToClipboard,
		loading,
	} = useStandup();

	return (
		<div className="border rounded-md bg-background p-4 min-h-[160px] flex flex-col h-full">
			{loading ? (
				<LoadingStatusMessages loading={loading} />
			) : !result ? (
				<EmptyResult />
			) : !editing ? (
				<>
					<ViewStandupSummary summary={result} />
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
