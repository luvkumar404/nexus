import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auditApi } from '../api/auditApi';
import { projectApi } from '../api/projectApi';
import { formatDate } from '../utils/formatDate';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  useEffect(() => { projectApi.get(id).then((res) => setData(res.data)); }, [id]);
  async function run() {
    const { data: audit } = await auditApi.start({ url: data.project.url, projectId: id });
    navigate(`/audit/${audit.auditId}`);
  }
  async function remove(auditId) {
    await auditApi.delete(auditId);
    setData((prev) => ({ ...prev, audits: prev.audits.filter((a) => a._id !== auditId) }));
    toast.success('Audit deleted');
  }
  if (!data) return <main className="p-8">Loading project...</main>;
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold">{data.project.name}</h1><p className="text-slate-500">{data.project.url}</p></div>
        <button onClick={run} className="focus-ring rounded-md bg-nexus px-4 py-2 font-semibold text-white">Run new audit</button>
      </div>
      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Saved audits</h2>
        <div className="mt-4 grid gap-3">
          {data.audits.map((audit) => (
            <div key={audit._id} className="flex flex-col gap-2 rounded-md border border-slate-100 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
              <div><Link to={`/audit/${audit._id}`} className="font-semibold hover:text-nexus">Score {audit.overallScore ?? audit.scores?.overall ?? 'NA'}/100</Link><p className="text-sm text-slate-500">{audit.status} | {formatDate(audit.createdAt)}</p></div>
              <button onClick={() => remove(audit._id)} className="rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">Delete</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
