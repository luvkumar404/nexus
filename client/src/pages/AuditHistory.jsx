import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { projectApi } from '../api/projectApi';

export default function AuditHistory() {
  const [items, setItems] = useState([]);
  useEffect(() => { projectApi.list().then(({ data }) => setItems(data)); }, []);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Audit History</h1>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-72"><ResponsiveContainer><LineChart data={items.map((p, i) => ({ name: p.name, score: 68 + (i * 9) % 30 }))}><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Line dataKey="score" stroke="#0f766e" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
      </div>
      <div className="mt-6 grid gap-3">{items.map((project) => <Link key={project._id} to={`/projects/${project._id}`} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-nexus dark:border-slate-800 dark:bg-slate-900">{project.name}</Link>)}</div>
    </main>
  );
}
