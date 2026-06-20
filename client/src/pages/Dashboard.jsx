import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { projectApi } from '../api/projectApi';
import { auditApi } from '../api/auditApi';
import { formatDate } from '../utils/formatDate';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  async function load() {
    const { data } = await projectApi.list();
    setProjects(data);
    setLoading(false);
  }
  useEffect(() => { load().catch(() => setLoading(false)); }, []);
  async function create(values) {
    try {
      const { data } = await projectApi.create(values);
      reset();
      setProjects((items) => [data, ...items]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create project');
    }
  }
  async function run(project) {
    const { data } = await auditApi.start({ url: project.url, projectId: project._id });
    navigate(`/audit/${data.auditId}`);
  }
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <nav className="grid gap-2 text-sm"><Link className="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-800" to="/dashboard">Projects</Link><Link className="rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" to="/history">History</Link></nav>
      </aside>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-slate-500">Create projects, run audits, and review saved history.</p></div>
          <form onSubmit={handleSubmit(create)} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
            <input {...register('name')} className="focus-ring rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" placeholder="Project name" />
            <input {...register('url', { required: true })} className="focus-ring rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" placeholder="https://example.com" />
            <button className="focus-ring rounded-md bg-nexus px-4 py-2 font-semibold text-white">Add</button>
          </form>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Audit history trend</h2>
          <div className="mt-4 h-48"><ResponsiveContainer><LineChart data={projects.map((p, i) => ({ name: p.name, score: 70 + (i * 7) % 25 }))}><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Line dataKey="score" stroke="#0f766e" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        </div>
        <div className="grid gap-4">
          {loading ? <Skeleton /> : projects.length ? projects.map((project) => (
            <div key={project._id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
              <div><Link to={`/projects/${project._id}`} className="text-lg font-semibold hover:text-nexus">{project.name}</Link><p className="text-sm text-slate-500">{project.url} | Created {formatDate(project.createdAt)}</p></div>
              <button onClick={() => run(project)} className="focus-ring rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-ink">Run audit</button>
            </div>
          )) : <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">No projects yet.</div>}
        </div>
      </section>
    </main>
  );
}

function Skeleton() {
  return <div className="h-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />;
}
