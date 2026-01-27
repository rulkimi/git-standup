"use client"

import { SessionProvider, SessionProviderProps } from "next-auth/react";
import { ReactNode } from "react";

interface PortalLayoutProps {
  children: ReactNode;
  session: SessionProviderProps["session"];
}

export default function PortalLayout({ children, session }: PortalLayoutProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}