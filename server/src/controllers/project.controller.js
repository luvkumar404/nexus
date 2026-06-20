import Project from '../models/Project.js';
import Audit from '../models/Audit.js';
import { assertPublicUrl } from '../utils/normalizeUrl.js';

export async function createProject(req, res) {
  const url = await assertPublicUrl(req.body.url);
  const project = await Project.create({ name: req.body.name || new URL(url).hostname, url });
  res.status(201).json(project);
}

export async function listProjects(req, res) {
  res.json(await Project.find({}).sort({ createdAt: -1 }));
}

export async function getProject(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const audits = await Audit.find({ project: project._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ project, audits });
}

export async function deleteProject(req, res) {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  await Audit.deleteMany({ project: project._id });
  res.json({ message: 'Project deleted' });
}
