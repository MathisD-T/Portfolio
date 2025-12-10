import fs from 'fs';
import path from 'path';
import { Project } from './types';

// Always resolve from project root so dist build & dev share the same data file.
const dataDir = path.resolve(process.cwd(), 'backend', 'data');
const dataPath = path.join(dataDir, 'projects.json');

const ensureDataFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf-8');
  }
};

const readProjects = (): Project[] => {
  ensureDataFile();
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw) as Project[];
};

const writeProjects = (projects: Project[]) => {
  ensureDataFile();
  fs.writeFileSync(dataPath, JSON.stringify(projects, null, 2), 'utf-8');
};

export const listProjects = (): Project[] => {
  return readProjects();
};

export const findProject = (id: string): Project | undefined => {
  return readProjects().find((project) => project.id === id);
};

export const createProject = (project: Project): Project => {
  const projects = readProjects();
  projects.push(project);
  writeProjects(projects);
  return project;
};

export const updateProject = (
  id: string,
  updates: Partial<Project>
): Project | null => {
  const projects = readProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: Project = { ...projects[index], ...updates, id };
  projects[index] = updated;
  writeProjects(projects);
  return updated;
};

export const deleteProject = (id: string): boolean => {
  const projects = readProjects();
  const next = projects.filter((p) => p.id !== id);
  if (next.length === projects.length) return false;
  writeProjects(next);
  return true;
};
