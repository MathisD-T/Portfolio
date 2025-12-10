import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  createProject,
  deleteProject,
  findProject,
  listProjects,
  updateProject,
} from './projectStore';
import { Project, ProjectInput } from './types';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Change the admin password via the ADMIN_PASSWORD environment variable.
// Example: ADMIN_PASSWORD="my-secret-password" npm run dev:server
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'terre777';

const sessions = new Set<string>();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return acc;
    acc[key] = rest.join('=');
    return acc;
  }, {});
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies['admin_session'];
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: 'Unauthorized: admin session required' });
  }
  next();
};

type ValidationResult = {
  data: Partial<Project>;
  errors: string[];
};

const sanitizeProjectPayload = (
  payload: ProjectInput | Partial<Project>,
  opts: { requireAll: boolean }
): ValidationResult => {
  const errors: string[] = [];
  const data: Partial<Project> = {};

  const setString = (
    field: keyof Project,
    required: boolean,
    allowEmpty = false
  ) => {
    const value = payload[field as keyof typeof payload];
    if (value === undefined || value === null || value === '') {
      if (required) errors.push(`${field} is required`);
      return;
    }
    if (typeof value !== 'string') {
      errors.push(`${field} must be a string`);
      return;
    }
    if (!allowEmpty && !value.trim()) {
      errors.push(`${field} cannot be empty`);
      return;
    }
    data[field] = value.trim() as never;
  };

  setString('title', opts.requireAll);
  setString('shortDescription', opts.requireAll);
  setString('fullDescription', false, true);
  setString('liveUrl', opts.requireAll);
  setString('githubUrl', false, true);
  setString('imageUrl', false, true);

  if (payload.technologies !== undefined) {
    if (Array.isArray(payload.technologies)) {
      const techList = payload.technologies
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
      if (techList.length === 0 && opts.requireAll) {
        errors.push('technologies must include at least one entry');
      } else {
        data.technologies = techList;
      }
    } else if (typeof payload.technologies === 'string') {
      const techList = payload.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (techList.length === 0 && opts.requireAll) {
        errors.push('technologies must include at least one entry');
      } else {
        data.technologies = techList;
      }
    } else {
      errors.push('technologies must be an array of strings or comma-separated string');
    }
  } else if (opts.requireAll) {
    errors.push('technologies is required');
  }

  if (payload.order !== undefined) {
    const parsedOrder = Number(payload.order);
    if (Number.isNaN(parsedOrder)) {
      errors.push('order must be a number');
    } else {
      data.order = parsedOrder;
    }
  } else if (opts.requireAll) {
    errors.push('order is required');
  }

  if (payload.isHighlighted !== undefined) {
    data.isHighlighted = Boolean(payload.isHighlighted);
  } else if (opts.requireAll) {
    data.isHighlighted = false;
  }

  return { data, errors };
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const sessionId = randomUUID();
  sessions.add(sessionId);
  res.setHeader(
    'Set-Cookie',
    `admin_session=${sessionId}; HttpOnly; Path=/; SameSite=Lax`
  );
  return res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies['admin_session'];
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.setHeader('Set-Cookie', 'admin_session=; Max-Age=0; Path=/; SameSite=Lax');
  res.json({ ok: true });
});

app.get('/api/projects', (_req, res) => {
  const projects = listProjects().sort((a, b) => {
    const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = findProject(req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json(project);
});

app.post('/api/projects', requireAdmin, (req, res) => {
  const { data, errors } = sanitizeProjectPayload(req.body, { requireAll: true });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid payload', errors });
  }

  const project: Project = {
    id: req.body.id || (randomUUID ? randomUUID() : `prj-${Date.now()}`),
    title: data.title!,
    shortDescription: data.shortDescription!,
    fullDescription: data.fullDescription || '',
    technologies: data.technologies || [],
    liveUrl: data.liveUrl!,
    githubUrl: data.githubUrl || '',
    imageUrl: data.imageUrl || '',
    isHighlighted: data.isHighlighted ?? false,
    order: data.order!,
  };

  const created = createProject(project);
  res.status(201).json(created);
});

app.put('/api/projects/:id', requireAdmin, (req, res) => {
  const { data, errors } = sanitizeProjectPayload(req.body, { requireAll: false });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Invalid payload', errors });
  }
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No fields provided to update' });
  }

  const updated = updateProject(req.params.id, data);
  if (!updated) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.json(updated);
});

app.delete('/api/projects/:id', requireAdmin, (req, res) => {
  const removed = deleteProject(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: 'Project not found' });
  }
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`API server ready on http://localhost:${PORT}`);
});
