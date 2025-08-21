'use client'

import { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0";

export default function Login() {
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    if (user) {
      fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              me {
                id
                email
                role
              }
            }
          `,
        }),
      }).catch((err) => console.error("Failed to sync user", err));
    }
  }, [user]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return <>Successful</>;
}
