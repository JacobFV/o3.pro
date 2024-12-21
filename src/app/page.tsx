"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import FishCanvas from "./_components/FishCanvas";

/**
 * Home Page:
 * - Displays the highest bid from "api.bid.getMax.useQuery()"
 * - Allows users to create a new bid with optional usage:
 *   If usage is provided, we also create a Post in the background.
 */
export default function Home() {
  // Local Form State
  const [hasBid, setHasBid] = useState(false);
  const [bidOption, setBidOption] = useState("");
  const [customBid, setCustomBid] = useState("");
  const [usage, setUsage] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });

  // For displaying (and refreshing) the countdown to Jan 1, 2025, 00:00 ET:
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    // This date is midnight ET (UTC-5). In 2025, that corresponds to 05:00 UTC.
    const targetDate = new Date("2025-01-01T05:00:00Z");

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("00 days 00:00:00.000");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      const millis = diff % 1000;

      setTimeRemaining(
        `${days} days ` +
          `${String(hours).padStart(2, "0")}:` +
          `${String(minutes).padStart(2, "0")}:` +
          `${String(seconds).padStart(2, "0")}.` +
          `${String(millis).padStart(3, "0")}`,
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Query the server for the current highest bid
  const { data: maxBid } = api.bid.getMax.useQuery();

  // Mutation to create a new bid
  const createBid = api.bid.create.useMutation({
    onSuccess: () => {
      setHasBid(true);
    },
  });

  // Mutation to update usage
  const updateUsage = api.bid.updateUsage.useMutation({
    onSuccess: () => {
      // Optionally do something after updating usage
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createBid.mutate({
      name: formData.name,
      email: formData.email,
      usage,
      bidOption,
      customBid,
    });
  };

  // State and function to toggle usage editing
  const [isEditingUsage, setIsEditingUsage] = useState(false);
  const [localUsage, setLocalUsage] = useState(usage);

  const handleUpdateUsage = () => {
    updateUsage.mutate({
      email: formData.email,
      usage: localUsage,
    });
    setUsage(localUsage);
    setIsEditingUsage(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-950/30 to-blue-900/30 p-8 font-sans text-white">
      {/* Updated background with FishCanvas */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-sky-600/15 to-blue-900/25 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.15),rgba(3,105,161,0.1))]" />
        <FishCanvas />
      </div>

      {/* Content Grid */}
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-start gap-8 md:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col justify-start gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl transition-all">
          <h1 className="mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-left text-5xl font-extrabold tracking-tight text-transparent drop-shadow-lg">
            o3.pro is for sale
          </h1>
          <p className="text-2xl font-medium italic">
            Current Price:{" "}
            <span className="font-bold not-italic">
              ${maxBid !== undefined ? maxBid.toLocaleString() : "XX,XXX"}
            </span>
          </p>
          <p className="text-lg font-light">
            Countdown to January&nbsp;1,&nbsp;2025:{" "}
            <em className="font-normal text-blue-100/90">{timeRemaining}</em>
          </p>
          <p className="text-sm text-white/80">
            At midnight (ET) on Jan&nbsp;1, o3.pro will go to the highest bidder
            or the first to pay 100k.
          </p>
        </div>

        {/* Right Column (Form) */}
        <div className="flex flex-col items-start justify-start gap-4">
          {!hasBid ? (
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition-all"
            >
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-semibold tracking-wide text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-white placeholder-white/50 backdrop-blur-sm transition duration-200 focus:border-white/20 focus:bg-white/15 focus:outline-none focus:ring-0"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-semibold tracking-wide text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-white placeholder-white/50 backdrop-blur-sm transition duration-200 focus:border-white/20 focus:bg-white/15 focus:outline-none focus:ring-0"
                  required
                />
              </div>

              {/* Usage */}
              <div>
                <label className="mb-1 block text-sm font-semibold tracking-wide text-gray-300">
                  What will you use o3.pro for? (optional)
                </label>
                <textarea
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                  className="h-24 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-white placeholder-white/50 backdrop-blur-sm transition duration-200 focus:border-white/20 focus:bg-white/15 focus:outline-none focus:ring-0"
                />
              </div>

              {/* Bid Options - fancier radio buttons */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold tracking-wide text-gray-300">
                  Bid Options
                </span>
                <div className="flex items-center gap-2">
                  <label
                    className={`cursor-pointer rounded-full border-2 px-3 py-1 transition-colors ${
                      bidOption === "5%"
                        ? "border-blue-400 bg-blue-400/10 text-blue-300"
                        : "border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bid"
                      value="5%"
                      className="hidden"
                      checked={bidOption === "5%"}
                      onChange={(e) => setBidOption(e.target.value)}
                    />
                    5% more
                  </label>

                  <label
                    className={`cursor-pointer rounded-full border-2 px-3 py-1 transition-colors ${
                      bidOption === "10%"
                        ? "border-blue-400 bg-blue-400/10 text-blue-300"
                        : "border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bid"
                      value="10%"
                      className="hidden"
                      checked={bidOption === "10%"}
                      onChange={(e) => setBidOption(e.target.value)}
                    />
                    10% more
                  </label>

                  <label
                    className={`cursor-pointer rounded-full border-2 px-3 py-1 transition-colors ${
                      bidOption === "custom"
                        ? "border-blue-400 bg-blue-400/10 text-blue-300"
                        : "border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bid"
                      value="custom"
                      className="hidden"
                      checked={bidOption === "custom"}
                      onChange={(e) => setBidOption(e.target.value)}
                    />
                    Custom
                  </label>
                </div>

                {bidOption === "custom" && (
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-white placeholder-white/50 backdrop-blur-sm transition duration-200 focus:border-white/20 focus:bg-white/15 focus:outline-none focus:ring-0"
                  />
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mx-auto mt-4 w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-10 py-3 font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                Submit
              </button>
            </form>
          ) : (
            <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl transition-all">
              <p className="text-lg font-semibold">
                Thank you, {formData.name}! You’ve placed a bid:
              </p>
              <p className="mt-1 text-base font-light">
                {bidOption === "custom"
                  ? `Custom amount: $${customBid}`
                  : `Bid ${bidOption} more`}
              </p>
              {usage && !isEditingUsage && (
                <p className="mt-2 text-sm text-gray-200">
                  You plan to use o3.pro for:
                  <em> {usage}</em>
                </p>
              )}

              {isEditingUsage ? (
                <div className="flex flex-col items-start gap-2">
                  <label className="block text-left text-sm font-semibold tracking-wide text-gray-300">
                    Update your usage
                  </label>
                  <textarea
                    value={localUsage}
                    onChange={(e) => setLocalUsage(e.target.value)}
                    className="h-24 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2.5 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/20 focus:bg-white/15 focus:outline-none"
                  />
                  <div className="flex w-full justify-end gap-2">
                    <button
                      onClick={() => setIsEditingUsage(false)}
                      className="rounded-lg border border-white/10 bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateUsage}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setLocalUsage(usage);
                    setIsEditingUsage(true);
                  }}
                  className="mt-2 inline-block w-full rounded-lg border border-blue-400 bg-blue-400/10 px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/20"
                >
                  Edit Usage
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}