"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // close mobile menu on route/session change
    setOpen(false);
  }, [status]);

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-sm border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md transform-gpu transition-transform duration-300 hover:scale-105">AH</div>
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-sky-800 leading-none">
              AskHeirs <span className="text-slate-400 font-medium">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            <Link href="#features" className="text-sm font-medium text-slate-700 hover:text-sky-700 transition-colors duration-200">Features</Link>
            <Link href="#how" className="text-sm font-medium text-slate-700 hover:text-sky-700 transition-colors duration-200">How it Works</Link>
            <Link href="#contact" className="text-sm font-medium text-slate-700 hover:text-sky-700 transition-colors duration-200">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-slate-700 hover:text-sky-700 transition-colors duration-200">Log in</Link>

            <Link href="/get-started" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-sm transition-all duration-200 transform-gpu hover:-translate-y-1">
              Get Started
            </Link>

            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((s) => !s)}
              className="md:hidden p-2 rounded-md inline-flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors duration-150"
            >
              {open ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-6 pt-2 flex flex-col gap-3 bg-white">
          <Link href="#features" className="py-2 text-slate-700 font-medium hover:text-sky-700 transition-colors">Features</Link>
          <Link href="#how" className="py-2 text-slate-700 font-medium hover:text-sky-700 transition-colors">How it Works</Link>
          <Link href="#contact" className="py-2 text-slate-700 font-medium hover:text-sky-700 transition-colors">Contact</Link>
          <Link href="/get-started" className="mt-2 inline-flex items-center justify-center bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-4 py-2 rounded-md shadow-sm">Get Started</Link>
        </div>
      </div>
    </header>
  );
}
