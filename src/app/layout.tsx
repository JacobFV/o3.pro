"use client";

import React, { useState } from "react";
import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";

// export const metadata: Metadata = {
//   title: "o3.pro",
//   description: "o3.pro",
//   icons: [{ rel: "icon", url: "/favicon.ico" }],
// };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isDayMode, setIsDayMode] = useState(false);

  return (
    <html lang="en" className={GeistSans.variable}>
      <body
        className={
          isDayMode
            ? "bg-white text-yellow-800 transition-colors duration-300"
            : "bg-gradient-to-br from-blue-950/30 to-blue-900/30 text-white transition-colors duration-300"
        }
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
        {/* Theme Toggle, top-right */}
        <button
          onClick={() => setIsDayMode((prev) => !prev)}
          className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-white/10"
          aria-label={isDayMode ? "Switch to night mode" : "Switch to day mode"}
        >
          {isDayMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </body>
    </html>
  );
}