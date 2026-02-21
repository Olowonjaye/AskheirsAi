export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div>
            <div className="text-xl font-bold text-white">Heirs Insurance</div>
            <div className="mt-4 text-sm text-slate-400">Trusted by professionals across Nigeria.</div>
          </div>

          <div className="flex items-center gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-8 w-20 bg-slate-700 rounded" />
              <div className="h-8 w-20 bg-slate-700 rounded" />
              <div className="h-8 w-20 bg-slate-700 rounded" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col md:flex-row md:justify-between items-center gap-4">
          <div className="text-sm text-slate-400">© {new Date().getFullYear()} Heirs Insurance. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-white">Terms of Service</a>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-slate-700 rounded" />
              <div className="h-6 w-6 bg-slate-700 rounded" />
              <div className="h-6 w-6 bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
