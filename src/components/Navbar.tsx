"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    // close mobile menu on route/session change
    setOpen(false);
  }, [status]);

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-sm border-b border-slate-100">
      <div
        className="mx-auto max-w-7xl px-6 navbar-bg-anim"
        style={{
            backgroundImage:
              "url('https://media.licdn.com/dms/image/v2/D4E3DAQEMaz5qcZ5HUg/image-scale_191_1128/B4EZxsTGsuGsAg-/0/1771343474138/heirsinsurancegroup_cover?e=2147483647&v=beta&t=JyI9souO6q2AFsU2-FtilRVG0XjPuung0xgPGv0VClg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "calc(0% + 24px) center",
            backgroundSize: "auto 70%",
            animation: "bgShift 12s ease-in-out infinite",
        }}
      >
        <style jsx>{`
          @keyframes bgShift {
              0% { background-position: calc(0% + 24px) center; }
              50% { background-position: center center; }
              100% { background-position: calc(0% + 24px) center; }
          }
          /* Disable animation on small screens where it can cause visible jumps */
          @media (max-width: 768px) {
            .navbar-bg-anim { animation: none !important; background-position: 100% center !important; }
          }
          /* Reduce motion for users who prefer it */
          @media (prefers-reduced-motion: reduce) {
            .navbar-bg-anim { animation: none !important; }
          }
        `}</style>
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://media.licdn.com/dms/image/v2/C4E0BAQF0faqsoz5SqA/company-logo_200_200/company-logo_200_200/0/1630620275967/heirs_life_logo?e=2147483647&v=beta&t=q2qJrNlN2K5ZHWLQ_aNO7fr26hIosaNm9C4XfqnwNpE"
              alt="AskHeirs AI logo"
              width={40}
              height={40}
              className="rounded-lg object-cover shadow-md transform-gpu transition-transform duration-300 hover:scale-105"
            />
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-sky-800 leading-none">
              AskHeirs <span className="text-slate-400 font-medium">Ai</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            <Link href="#features" className="text-sm font-bold text-slate-700 hover:text-sky-500 transition-colors duration-200">Features</Link>
            <Link href="#how" className="text-sm font-bold text-slate-700 hover:text-sky-500 transition-colors duration-200">How it Works</Link>
            <Link href="#contact" className="text-sm font-bold text-slate-700 hover:text-sky-500 transition-colors duration-200">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="relative hidden sm:flex items-center gap-3">
                <button onClick={() => setProfileOpen((s) => !s)} className="text-sm font-medium text-slate-700 px-3 py-1 rounded flex items-center gap-2" aria-haspopup="true" aria-expanded={profileOpen}>
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image src={session.user.image || "/images/i.png"} alt="avatar" width={32} height={32} className="object-cover" />
                  </div>
                  <span>Hi, {session.user.name ?? session.user.email}</span>
                </button>
                <div className="relative">
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Account</Link>
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign out</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex text-sm font-bold text-slate-700 hover:text-sky-400 transition-colors duration-200">Log in</Link>

                <Link href="/register" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-sm transition-all duration-200 transform-gpu hover:-translate-y-1">
                  Get Started
                </Link>
              </>
            )}
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
          {session?.user ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="mt-2 w-full text-left py-2 text-slate-700 font-medium hover:text-sky-700 transition-colors">Sign out</button>
          ) : (
            <Link href="/register" className="mt-2 inline-flex items-center justify-center bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-4 py-2 rounded-md shadow-sm">Get Started</Link>
          )}
        </div>
      </div>
    </header>
  );
}
