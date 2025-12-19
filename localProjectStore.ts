import { Project, ProjectInput } from './types';

const STORAGE_KEY = 'portfolio:projects:v1';
const SESSION_KEY = 'portfolio:admin:session';
const ADMIN_PASSWORD = 'terre777';

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '59f66634-d307-4772-a8af-1f979c8333ef',
    title: 'Maison des jeunes',
    shortDescription: 'Site web pour les maisons des jeunes de Charlevoix Est',
    fullDescription: '',
    technologies: ['React', 'Vite'],
    liveUrl: 'http://51.79.55.227/',
    githubUrl: '',
    imageUrl: '',
    isHighlighted: false,
    order: 1,
  },
  {
    id: 'e0f4dfff-b483-4d3e-814b-841097650721',
    title: 'Les beaux projets',
    shortDescription: 'Site vitrine pour un entrepreneur general',
    fullDescription: '',
    technologies: ['React', 'Vite'],
    liveUrl: 'https://mathisd-t.github.io/lbp/',
    githubUrl: '',
    imageUrl: '',
    isHighlighted: false,
    order: 2,
  },
  {
    id: '51396bf3-75d4-4dbb-88e5-1a666fdf0146',
    title: 'Chez Hector',
    shortDescription: 'Prototype de site pour un restaurant',
    fullDescription: '',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://mathisd-t.github.io/demo/demos/Chezhector/',
    githubUrl: '',
    imageUrl: '',
    isHighlighted: false,
    order: 3,
  },
  {
    id: '51396bf3-75d4-4dbb-88e5-1a666fdf0147',
    title: 'La Signature',
    shortDescription: 'Prototype de site pour un restaurant',
    fullDescription: '',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://mathisd-t.github.io/signature/',
    githubUrl: '',
    imageUrl: '',
    isHighlighted: false,
    order: 4,
  },
];

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - older TS lib types do not include randomUUID on the crypto global
    return crypto.randomUUID();
  }
  return `prj-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const cloneProjects = (projects: Project[]): Project[] =>
  projects.map((project) => ({
    ...project,
    technologies: [...project.technologies],
  }));

const readProjects = (): Project[] => {
  const storage = getStorage();
  const raw = storage?.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Project[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // ignore parse errors, fall back to defaults
    }
  }
  return cloneProjects(DEFAULT_PROJECTS);
};

const persistProjects = (projects: Project[]) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

const ensureSeeded = () => {
  const storage = getStorage();
  if (!storage) return;
  if (!storage.getItem(STORAGE_KEY)) {
    storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
  }
};

export const listProjects = async (): Promise<Project[]> => {
  ensureSeeded();
  return cloneProjects(readProjects());
};

export const createProject = async (input: ProjectInput): Promise<Project> => {
  const next: Project = { ...input, id: generateId() };
  const projects = readProjects();
  projects.push(next);
  persistProjects(projects);
  return { ...next, technologies: [...next.technologies] };
};

export const updateProject = async (
  id: string,
  updates: Partial<ProjectInput>
): Promise<Project> => {
  const projects = readProjects();
  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) {
    throw new Error('NOT_FOUND');
  }
  const updated: Project = { ...projects[index], ...updates, id };
  projects[index] = updated;
  persistProjects(projects);
  return { ...updated, technologies: [...updated.technologies] };
};

export const deleteProject = async (id: string): Promise<void> => {
  const projects = readProjects().filter((project) => project.id !== id);
  persistProjects(projects);
};

export const resetProjects = async (): Promise<Project[]> => {
  persistProjects(DEFAULT_PROJECTS);
  return cloneProjects(DEFAULT_PROJECTS);
};

export const isAuthenticated = (): boolean => {
  const storage = getStorage();
  return storage?.getItem(SESSION_KEY) === '1';
};

export const login = async (password: string): Promise<boolean> => {
  const ok = password === ADMIN_PASSWORD;
  const storage = getStorage();
  if (ok && storage) {
    storage.setItem(SESSION_KEY, '1');
  }
  return ok;
};

export const logout = async (): Promise<void> => {
  const storage = getStorage();
  storage?.removeItem(SESSION_KEY);
};

export const getAdminPasswordHint = () => ADMIN_PASSWORD;
