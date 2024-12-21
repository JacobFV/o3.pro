"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import FishCanvas from "./_components/FishCanvas";
import { useThemeMode } from "~/contexts/ThemeContext";

/**
 * Home Page:
 * - Displays the highest bid from "api.bid.getMax.useQuery()"
 * - Allows users to create a new bid with optional usage:
 *   If usage is provided, we also create a Post in the background.
 */
export default function Home() {
  const { isDayMode } = useThemeMode();
  // Local Form State
  const [hasOffer, setHasOffer] = useState(false);
  const [offerOption, setOfferOption] = useState("");
  const [customOffer, setCustomOffer] = useState("");
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
  const { data: maxOffer } = api.bid.getMax.useQuery();

  // Mutation to create a new bid
  const createOffer = api.bid.create.useMutation({
    onSuccess: () => {
      setHasOffer(true);
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
    createOffer.mutate({
      name: formData.name,
      email: formData.email,
      usage,
      bidOption: offerOption,
      customBid: customOffer,
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
    <main
      className={`relative min-h-screen overflow-hidden p-8 font-sans ${
        isDayMode
          ? "bg-gradient-to-br from-blue-100 to-blue-50"
          : "bg-gradient-to-br from-blue-950 to-blue-900"
      }`}
    >
      {/* Background layers */}
      <div className="absolute inset-0 -z-10">
        <div
          className={`absolute inset-0 mix-blend-overlay ${
            isDayMode
              ? "bg-gradient-to-b from-sky-200/30 via-sky-300/20 to-blue-200/25"
              : "bg-gradient-to-b from-sky-950/50 via-sky-900/30 to-blue-950/40"
          }`}
        />
        <div
          className={`absolute inset-0 ${
            isDayMode
              ? "bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.1),rgba(3,105,161,0.05))]"
              : "bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.05),rgba(3,105,161,0.2))]"
          }`}
        />
        <FishCanvas />
      </div>

      {/* Content Grid */}
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-start gap-8 md:grid-cols-2">
        {/* Left Column */}
        <div
          className={`flex flex-col justify-start gap-6 rounded-2xl border p-8 shadow-2xl backdrop-blur-xl transition-all ${
            isDayMode
              ? "border-black/5 bg-white/40"
              : "border-white/5 bg-white/[0.02]"
          }`}
        >
          <h1
            className={`mb-6 bg-clip-text text-left text-5xl font-extrabold tracking-tight text-transparent drop-shadow-lg ${
              isDayMode
                ? "bg-gradient-to-r from-blue-900 to-blue-800"
                : "bg-gradient-to-r from-white to-white/80"
            }`}
          >
            o3.pro is for sale
          </h1>
          <p
            className={`text-2xl font-medium italic ${isDayMode ? "text-blue-900" : "text-white"}`}
          >
            Current Price:{" "}
            <span className="font-bold not-italic">
              ${maxOffer !== undefined ? maxOffer.toLocaleString() : "XX,XXX"}
            </span>
          </p>
          <p
            className={`text-lg font-light ${isDayMode ? "text-blue-900" : "text-white"}`}
          >
            Countdown to January&nbsp;1,&nbsp;2025:{" "}
            <em
              className={`font-normal ${isDayMode ? "text-blue-800" : "text-blue-100/90"}`}
            >
              {timeRemaining}
            </em>
          </p>
          <p
            className={`text-sm ${isDayMode ? "text-blue-900/80" : "text-white/80"}`}
          >
            At midnight (ET) on Jan&nbsp;1, o3.pro will go to the highest offer
            or the first to exceed $100k.
          </p>
        </div>

        {/* Right Column (Form) */}
        <div className="flex flex-col items-start justify-start gap-4">
          {!hasOffer ? (
            <form
              onSubmit={handleSubmit}
              className={`flex w-full max-w-md flex-col gap-6 rounded-2xl border p-8 shadow-2xl backdrop-blur-xl transition-all ${
                isDayMode
                  ? "border-black/5 bg-white/40"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              {/* Name */}
              <div>
                <label
                  className={`mb-1 block text-sm font-semibold tracking-wide ${
                    isDayMode ? "text-blue-900" : "text-gray-300"
                  }`}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`w-full rounded-lg border px-4 py-2.5 transition duration-200 focus:outline-none focus:ring-0 ${
                    isDayMode
                      ? "border-black/10 bg-white/50 text-blue-900 placeholder-blue-900/50 focus:border-blue-500/20 focus:bg-white/60"
                      : "border-white/10 bg-black/20 text-white placeholder-white/30 focus:border-white/20 focus:bg-black/30"
                  }`}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className={`mb-1 block text-sm font-semibold tracking-wide ${
                    isDayMode ? "text-blue-900" : "text-gray-300"
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={`w-full rounded-lg border px-4 py-2.5 transition duration-200 focus:outline-none focus:ring-0 ${
                    isDayMode
                      ? "border-black/10 bg-white/50 text-blue-900 placeholder-blue-900/50 focus:border-blue-500/20 focus:bg-white/60"
                      : "border-white/10 bg-black/20 text-white placeholder-white/30 focus:border-white/20 focus:bg-black/30"
                  }`}
                  required
                />
              </div>

              {/* Usage */}
              <div>
                <label
                  className={`mb-1 block text-sm font-semibold tracking-wide ${
                    isDayMode ? "text-blue-900" : "text-gray-300"
                  }`}
                >
                  What will you use o3.pro for? (optional)
                </label>
                <textarea
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                  className={`h-24 w-full rounded-lg border px-4 py-2.5 transition duration-200 focus:outline-none focus:ring-0 ${
                    isDayMode
                      ? "border-black/10 bg-white/50 text-blue-900 placeholder-blue-900/50 focus:border-blue-500/20 focus:bg-white/60"
                      : "border-white/10 bg-black/20 text-white placeholder-white/30 focus:border-white/20 focus:bg-black/30"
                  }`}
                />
              </div>

              {/* Offer Options - fancier radio buttons */}
              <div className="flex flex-col gap-2">
                <span
                  className={`text-sm font-semibold tracking-wide ${
                    isDayMode ? "text-blue-900" : "text-gray-300"
                  }`}
                >
                  Offer Options
                </span>
                <div className="flex items-center gap-2">
                  <label
                    className={`cursor-pointer rounded-full border-2 px-3 py-1 transition-colors ${
                      offerOption === "5%"
                        ? isDayMode
                          ? "border-blue-600 bg-blue-100 text-blue-800"
                          : "border-blue-400 bg-blue-400/10 text-blue-300"
                        : isDayMode
                          ? "border-blue-900/20 text-blue-900/70 hover:bg-blue-50"
                          : "border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="offer"
                      value="5%"
                      className="hidden"
                      checked={offerOption === "5%"}
                      onChange={(e) => setOfferOption(e.target.value)}
                    />
                    5% more
                  </label>

                  <label
                    className={`cursor-pointer rounded-full border-2 px-3 py-1 transition-colors ${
                      offerOption === "10%"
                        ? isDayMode
                          ? "border-blue-600 bg-blue-100 text-blue-800"
                          : "border-blue-400 bg-blue-400/10 text-blue-300"
                        : isDayMode
                          ? "border-blue-900/20 text-blue-900/70 hover:bg-blue-50"
                          : "border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="offer"
                      value="10%"
                      className="hidden"
                      checked={offerOption === "10%"}
                      onChange={(e) => setOfferOption(e.target.value)}
                    />
                    10% more
                  </label>
                  <label
                    className={`cursor-pointer rounded-full border-2 px-3 py-1 transition-colors ${
                      offerOption === "custom"
                        ? isDayMode
                          ? "border-blue-600 bg-blue-100 text-blue-800"
                          : "border-blue-400 bg-blue-400/10 text-blue-300"
                        : isDayMode
                          ? "border-blue-900/20 text-blue-900/70 hover:bg-blue-50"
                          : "border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="offer"
                      value="custom"
                      className="hidden"
                      checked={offerOption === "custom"}
                      onChange={(e) => setOfferOption(e.target.value)}
                    />
                    Custom
                  </label>
                </div>

                {offerOption === "custom" && (
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    value={customOffer}
                    onChange={(e) => setCustomOffer(e.target.value)}
                    className={`mt-2 w-full rounded-lg border px-4 py-2.5 transition duration-200 focus:outline-none focus:ring-0 ${
                      isDayMode
                        ? "border-black/10 bg-white/50 text-blue-900 placeholder-blue-900/50 focus:border-blue-500/20 focus:bg-white/60"
                        : "border-white/10 bg-black/20 text-white placeholder-white/30 focus:border-white/20 focus:bg-black/30"
                    }`}
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
            <div
              className={`w-full max-w-md space-y-4 rounded-2xl border p-8 text-center shadow-2xl backdrop-blur-xl transition-all ${
                isDayMode
                  ? "border-black/5 bg-white/40"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              <p
                className={`text-lg font-semibold ${isDayMode ? "text-blue-900" : "text-white"}`}
              >
                Thank you, {formData.name}! You've placed an offer:
              </p>
              <p
                className={`mt-1 text-base font-light ${isDayMode ? "text-blue-900" : "text-white"}`}
              >
                {offerOption === "custom"
                  ? `Custom amount: $${customOffer}`
                  : `Offer ${offerOption} more`}
              </p>
              {usage && !isEditingUsage && (
                <p
                  className={`mt-2 text-sm ${isDayMode ? "text-blue-900" : "text-white"}`}
                >
                  You plan to use o3.pro for:
                  <em> {usage}</em>
                </p>
              )}

              {isEditingUsage ? (
                <div className="flex flex-col items-start gap-2">
                  <label
                    className={`block text-left text-sm font-semibold tracking-wide ${
                      isDayMode ? "text-blue-900" : "text-gray-300"
                    }`}
                  >
                    Update your usage
                  </label>
                  <textarea
                    value={localUsage}
                    onChange={(e) => setLocalUsage(e.target.value)}
                    className={`h-24 w-full rounded-lg border px-4 py-2.5 transition duration-200 focus:outline-none focus:ring-0 ${
                      isDayMode
                        ? "border-black/10 bg-white/50 text-blue-900 placeholder-blue-900/50 focus:border-blue-500/20 focus:bg-white/60"
                        : "border-white/10 bg-black/20 text-white placeholder-white/30 focus:border-white/20 focus:bg-black/30"
                    }`}
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
