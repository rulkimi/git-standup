"use client"

import Header from "@/components/header";
import { RepositoriesProvider } from "@/components/providers/repositories-provider";
import { SessionProvider, SessionProviderProps } from "next-auth/react";
import { ReactNode } from "react";

interface PortalLayoutProps {
  children: ReactNode;
  repositories: ReactNode;
  session: SessionProviderProps["session"];
}

export default function PortalLayout({ children, repositories, session }: PortalLayoutProps) {
  return (
    <SessionProvider session={session}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <RepositoriesProvider>
            {repositories}
            {children}
          </RepositoriesProvider>
        </div>
      </main>
    </SessionProvider>
  )
}