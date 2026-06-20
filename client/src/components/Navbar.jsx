import { Link, NavLink, useLocation } from 'react-router-dom';
import { Moon, Sun, Gauge } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { pathname } = useLocation();
  const isAuditReport = pathname.startsWith('/audit/');
  const [dark, setDark] = useState(localStorage.getItem('nexus_theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('nexus_theme', dark ? 'dark' : 'light');
  }, [dark]);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <a href="#main-content" className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 dark:focus:bg-slate-900">Skip to content</a>
      <div className={`mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8 ${isAuditReport ? 'max-w-[1536px]' : 'max-w-7xl'}`}>
        <Link to="/" className="flex min-w-0 items-center gap-2 text-base font-semibold sm:text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-nexus text-white"><Gauge size={20} /></span>
          <span className="truncate">Nexus SEO Auditor</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <NavLink to="/dashboard" className="rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Dashboard</NavLink>
          <button onClick={() => setDark((v) => !v)} className="focus-ring rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
