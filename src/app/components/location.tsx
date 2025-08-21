
"use client";
import { useState } from "react";

export default function ClockInButton() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClockIn = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);

        // TODO: Call GraphQL mutation here
        // Example: send coords.lat & coords.lng to `clockIn` mutation

        setLoading(false);
      },
      (err) => {
        console.error("Location error:", err);
        setLoading(false);
      },
      {
        enableHighAccuracy: true, // forces GPS chip use if available
        timeout: 10000,           // give GPS time to get a fix
        maximumAge: 0,            // no cached position
      }
    );
  };

  return (
    <div>
      <button onClick={handleClockIn} disabled={loading}>
        {loading ? "Getting location..." : "Clock In"}
      </button>
      {location && (
        <p>
          Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
