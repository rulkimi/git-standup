"use client"

import { useState } from "react";
import { useRepositories } from "@/components/providers/repositories-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const MAX_SHOWN = 5;

export default function SelectedRepositories() {
  const { repositories } = useRepositories();
  const [showAll, setShowAll] = useState(false);

  if (repositories.length === 0) {
    return (
      <div className="p-4 rounded-md border bg-background text-muted-foreground text-sm flex items-center justify-between gap-2">
        <span>No repositories selected.</span>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="ml-2">
            + Add repo
          </Button>
        </DialogTrigger>
      </div>
    );
  }

  const shown = showAll ? repositories : repositories.slice(0, MAX_SHOWN);
  const remaining = repositories.length - MAX_SHOWN;

  return (
    <div className="p-4 rounded-md border bg-background flex flex-col gap-2">
      <div className="flex items-center">
        <span className="text-xs text-muted-foreground uppercase font-semibold">Selected repositories</span>
        &nbsp;
        <span className="text-muted-foreground text-xs">
          ({repositories.length}{repositories.length === 1 ? " repo" : " repos"})
        </span>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <AnimatePresence initial={false}>
          {shown.map((repo) => (
            <motion.div
              key={repo}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant="secondary"
                className="px-2 py-1 text-sm font-medium rounded"
              >
                {repo}
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
        {!showAll && remaining > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-muted-foreground text-sm font-medium rounded border border-dashed ml-1"
            onClick={() => setShowAll(true)}
          >
            +{remaining} more
          </Button>
        )}
        {showAll && repositories.length > MAX_SHOWN && (
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-muted-foreground text-xs font-medium rounded border border-dashed ml-1"
            onClick={() => setShowAll(false)}
          >
            Show less
          </Button>
        )}
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="px-2 py-1 text-xs font-medium rounded ml-1"
          >
            Select more
          </Button>
        </DialogTrigger>
      </div>
    </div>
  );
}