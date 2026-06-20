import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Activity, FileText, Gauge, Image, Link2, Search, ShieldCheck, Smartphone } from 'lucide-react';
import { auditApi } from '../api/auditApi';

const features = [
  ['Technical SEO', ShieldCheck], ['On-Page SEO', Search], ['Page Speed', Gauge], ['Mobile SEO', Smartphone],
  ['Broken Links', Link2], ['Image SEO', Image], ['Schema Markup', Activity], ['PDF Report', FileText]
];

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  async function onSubmit(values) {
    setLoading(true);
    try {
      const { data } = await auditApi.start({ url: values.url });
      navigate(`/audit/${data.auditId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not start audit');
    } finally {
      setLoading(false);
    }
  }
  return (
    <main id="main-content">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold uppercase tracking-wide text-nexus">Nexus SEO Auditor</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">Find technical, content, and speed issues before search engines do.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">Run a structured crawl, inspect metadata and links, review Lighthouse metrics, and export a client-ready report from one workflow.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:flex-row" aria-label="Start SEO audit">
            <label htmlFor="audit-url" className="sr-only">Website URL</label>
            <input
              id="audit-url"
              type="url"
              inputMode="url"
              autoComplete="url"
              {...register('url', { required: true })}
              className="focus-ring min-h-12 flex-1 rounded-md border border-slate-200 px-4 dark:border-slate-700 dark:bg-slate-950"
              placeholder="https://example.com"
              aria-describedby="audit-url-help"
            />
            <button type="submit" disabled={loading} className="focus-ring rounded-md bg-nexus px-6 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Starting...' : 'Run Free SEO Audit'}</button>
          </form>
          <p id="audit-url-help" className="mt-2 text-sm text-slate-500">Enter a public URL to generate a scored SEO report.</p>
        </motion.div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-3">
            {features.map(([label, Icon]) => <div key={label} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800"><Icon className="text-nexus" size={22} /><p className="mt-3 font-semibold">{label}</p></div>)}
          </div>
        </div>
      </section>
      <section className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3">
          {['Submit a public URL', 'Crawler inspects pages', 'Review prioritized fixes'].map((item, index) => (
            <div key={item}><span className="text-sm font-bold text-coral">0{index + 1}</span><h2 className="mt-2 text-xl font-semibold">{item}</h2><p className="mt-2 text-slate-600 dark:text-slate-300">Nexus validates the target, gathers real page data, and turns findings into scored recommendations.</p></div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div><h2 className="text-3xl font-bold">Sample report preview</h2><p className="mt-3 text-slate-600 dark:text-slate-300">The report combines category scores, issue severity, crawled-page data, mobile checks, structured data, and speed diagnostics.</p></div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-3 sm:grid-cols-4">{['Score 82', '12 Issues', '25 Pages', 'PDF Ready'].map((x) => <div key={x} className="rounded-md bg-slate-50 p-4 font-semibold dark:bg-slate-800">{x}</div>)}</div>
            <div className="mt-5 h-40 rounded-md bg-[linear-gradient(135deg,#e2e8f0,#ccfbf1,#fed7aa)] dark:bg-[linear-gradient(135deg,#1e293b,#134e4a,#7c2d12)]" />
          </div>
        </div>
      </section>
    </main>
  );
}
