"use client"

import Header from "@/components/header";
import { RepositoriesProvider } from "@/components/providers/repositories-provider";
import { Separator } from "@/components/ui/separator";
import { SessionProvider, SessionProviderProps } from "next-auth/react";
import { ReactNode } from "react";

interface PortalLayoutProps {
  repositories: ReactNode;
  generate: ReactNode;
  session: SessionProviderProps["session"];
}

export default function PortalLayout({ generate, repositories, session }: PortalLayoutProps) {
  return (
    <SessionProvider session={session}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-4">
          <RepositoriesProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repositories}
              {generate}
            </div>
          </RepositoriesProvider>
      </main>
    </SessionProvider>
  )
}