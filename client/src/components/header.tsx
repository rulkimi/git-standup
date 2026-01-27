"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "./ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils"; // If shadcn's `cn` utility is available; otherwise, remove this import.

export default function Header() {
  const { data: session } = useSession();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur"
      )}
    >
      <div
        className={cn(
          "max-w-5xl mx-auto flex items-center justify-between px-6 py-3"
        )}
      >
        <div className="flex items-center gap-2">
          <Image 
            src="https://img.icons8.com/?size=100&id=106562&format=png&color=000000"
            alt="GitHub Logo"
            width={28}
            height={28}
            priority
          />
          <span className="font-semibold text-lg tracking-tight">Git Standup</span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden sm:inline font-medium text-muted-foreground">
                Hi, {session.user?.name}
              </span>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => signIn()} variant="default">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}