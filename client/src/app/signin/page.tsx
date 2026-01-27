"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import getRepositoriesList from "@/actions/github"; // Import the function

export default function SignInPage() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    console.log("Session updated:", session);
    if (session && !calledRef.current) {
      calledRef.current = true;
      console.log("Fetching repositories list...");
      getRepositoriesList()
        .then(data => {
          console.log("Fetched repositories data:", data);
          setRepos(JSON.stringify(data, null, 2));
        })
        .catch((err) => {
          console.error("Failed to fetch repos.", err);
          setRepos("Failed to fetch repos.");
        });
    }
  }, [session]);

  if (session) {
    console.log("User is signed in:", session);
    return (
      <div>
        Signed In as {session.user?.name} - {session.accessToken};
        <button onClick={() => {
          console.log("Signing out...");
          signOut();
        }}>Sign Out</button>
        <div>
          <h3>Repos fetch result:</h3>
          <pre>{repos ?? "Fetching repos..."}</pre>
        </div>
      </div>
    )
  }

  console.log("User is not signed in");
  return (
    <div>
      Not Signed In
      <button onClick={() => {
        console.log("Signing in...");
        signIn();
      }}>SignIn</button>
    </div>
  )
}