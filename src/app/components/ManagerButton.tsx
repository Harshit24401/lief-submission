
"use client";
import { useState } from "react";
import { Button, App } from "antd";
import { gqlFetch } from "../../lib/graphqlfetch"; // adjust path if needed

export default function MakeMeManagerButton() {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp(); // ✅ use message from App context

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await gqlFetch(
        `mutation {
          makeMeManager {
            id
            email
            role
          }
        }`
      );
      message.success("You are now a Manager!");
      console.log("Updated user:", result.makeMeManager);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="primary" loading={loading} onClick={handleClick}>
      Make Me Manager
    </Button>
  );
}
