import React, { useEffect, useMemo, useState } from 'react';
import { Project } from '../types';
import {
  createProject,
  deleteProject,
  getAdminPasswordHint,
  isAuthenticated as isAuthenticatedStore,
  listProjects,
  login,
  logout,
  resetProjects,
  updateProject,
} from '../localProjectStore';

type FormState = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  technologies: string;
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
  isHighlighted: boolean;
  order: number;
};

const createEmptyForm = (nextOrder = 1): FormState => ({
  title: '',
  shortDescription: '',
  fullDescription: '',
  technologies: '',
  liveUrl: '',
  githubUrl: '',
  imageUrl: '',
  isHighlighted: false,
  order: nextOrder,
});

export const AdminPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAuthenticatedStore());
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>(createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const homeHref = import.meta.env.BASE_URL || '/';

  useEffect(() => {
    loadProjects();
  }, []);

  const orderedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
      ),
    [projects]
  );

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listProjects();
      setProjects(data);
      if (!editingId) {
        setFormState(createEmptyForm(data.length + 1));
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les projets.');
    } finally {
      setIsLoading(false);
    }
  };

  const toTechArray = (value: string | string[]): string[] => {
    if (Array.isArray(value)) return value;
    return value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const resetForm = () => {
    setFormState(createEmptyForm(projects.length + 1));
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setError('Connexion admin requise.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);

    const payload = {
      title: formState.title.trim(),
      shortDescription: formState.shortDescription.trim(),
      fullDescription: formState.fullDescription.trim(),
      technologies: toTechArray(formState.technologies),
      liveUrl: formState.liveUrl.trim(),
      githubUrl: formState.githubUrl.trim(),
      imageUrl: formState.imageUrl.trim(),
      isHighlighted: formState.isHighlighted,
      order: Number(formState.order) || 0,
    };

    try {
      if (editingId) {
        await updateProject(editingId, payload);
      } else {
        await createProject(payload);
      }
      await loadProjects();
      resetForm();
      setNotice(editingId ? 'Projet mis a jour.' : 'Projet cree.');
    } catch (err) {
      console.error(err);
      setError('Impossible de sauvegarder le projet.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setFormState({
      title: project.title,
      shortDescription: project.shortDescription,
      fullDescription: project.fullDescription || '',
      technologies: project.technologies.join(', '),
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl || '',
      imageUrl: project.imageUrl || '',
      isHighlighted: project.isHighlighted,
      order: project.order,
    });
  };

  const handleDelete = async (project: Project) => {
    const ok = window.confirm(`Supprimer "${project.title}" ?`);
    if (!ok) return;
    setError(null);
    setNotice(null);
    try {
      await deleteProject(project.id);
      await loadProjects();
      if (editingId === project.id) {
        resetForm();
      }
      setNotice('Projet supprime.');
    } catch (err) {
      console.error(err);
      setError('Impossible de supprimer le projet.');
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const ok = await login(passwordInput.trim());
      if (!ok) {
        setAuthError('Mot de passe incorrect.');
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      setPasswordInput('');
      setNotice("Connecte en tant qu'admin.");
    } catch (err) {
      console.error(err);
      setAuthError('Impossible de verifier le mot de passe.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setNotice('Deconnecte.');
  };

  const handleResetData = async () => {
    const ok = window.confirm('Recharger les donnees par defaut ? (efface les donnees locales)');
    if (!ok) return;
    const restored = await resetProjects();
    setProjects(restored);
    resetForm();
    setNotice('Donnees remises a zero localement.');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-mono text-xs p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="uppercase tracking-widest">
          <div className="text-zinc-500 text-[11px]">[ ADMIN_PANEL // PROJECTS ]</div>
          <div className="text-white text-lg">Portfolio Control</div>
          <div className="text-[11px] text-zinc-500">
            Donnees stockees localement (pas de backend).
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <a
            href={homeHref}
            className="text-zinc-500 hover:text-white underline decoration-1 underline-offset-4"
          >
            Retour au site
          </a>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-[11px] uppercase border border-zinc-700 px-3 py-1 hover:bg-white hover:text-black transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <div className="border border-zinc-800 p-4 mb-6">
        <div className="uppercase tracking-widest text-[11px] text-zinc-500 mb-2">
          Connexion admin (mot de passe stocke uniquement sur le client)
        </div>
        <form
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-end"
          onSubmit={handleLogin}
        >
          <label className="flex flex-col gap-1 text-[11px] uppercase w-full sm:w-auto">
            Mot de passe
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="bg-black border border-zinc-700 px-2 py-2 text-white"
              placeholder="ADMIN_PASSWORD"
            />
          </label>
          <button
            type="submit"
            disabled={authLoading}
            className="text-[11px] uppercase border border-zinc-700 px-3 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {authLoading ? 'Connexion...' : 'Se connecter'}
          </button>
          {!isAuthenticated && (
            <span className="text-[11px] text-zinc-500">
              Mot de passe par defaut: {getAdminPasswordHint()}
            </span>
          )}
        </form>
        {authError && <div className="text-red-500 mt-2 text-[12px]">{authError}</div>}
        {isAuthenticated && (
          <div className="text-green-500 mt-2 text-[12px]">Session admin active.</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 border border-zinc-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="uppercase tracking-widest text-[11px] text-zinc-500">
              Liste des projets ({projects.length})
            </span>
            <div className="flex gap-2">
              <button
                onClick={resetForm}
                className="text-[11px] uppercase border border-zinc-700 px-3 py-1 hover:bg-white hover:text-black transition-colors"
              >
                Nouveau
              </button>
              <button
                onClick={handleResetData}
                className="text-[11px] uppercase border border-zinc-700 px-3 py-1 hover:bg-zinc-800 transition-colors"
              >
                Reset local
              </button>
            </div>
          </div>

          {isLoading && <div className="text-zinc-500">Chargement...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {notice && <div className="text-green-500">{notice}</div>}

          {!isLoading && !error && (
            <div className="divide-y divide-zinc-800">
              {orderedProjects.map((project) => (
                <div
                  key={project.id}
                  className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="text-white text-sm">{project.title}</div>
                    <div className="text-zinc-500 text-[11px]">
                      #{project.order} - {project.technologies.join(', ')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(project)}
                      className="border border-zinc-700 px-3 py-1 text-[11px] uppercase hover:bg-white hover:text-black transition-colors"
                      disabled={!isAuthenticated}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="border border-red-700 text-red-400 px-3 py-1 text-[11px] uppercase hover:bg-red-600 hover:text-white transition-colors"
                      disabled={!isAuthenticated}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {orderedProjects.length === 0 && (
                <div className="text-zinc-500 py-4">Aucun projet enregistre.</div>
              )}
            </div>
          )}
        </section>

        <section className="border border-zinc-800 p-4 space-y-4">
          <div className="uppercase tracking-widest text-[11px] text-zinc-500">
            {editingId ? `Edition: ${editingId}` : 'Nouveau projet'}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="flex flex-col gap-1 text-[11px] uppercase">
              Titre
              <input
                className="bg-black border border-zinc-700 px-2 py-2 text-white"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                required
                disabled={!isAuthenticated}
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] uppercase">
              Courte description
              <input
                className="bg-black border border-zinc-700 px-2 py-2 text-white"
                value={formState.shortDescription}
                onChange={(e) =>
                  setFormState({ ...formState, shortDescription: e.target.value })
                }
                required
                disabled={!isAuthenticated}
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] uppercase">
              Description detaillee
              <textarea
                className="bg-black border border-zinc-700 px-2 py-2 text-white h-20"
                value={formState.fullDescription}
                onChange={(e) =>
                  setFormState({ ...formState, fullDescription: e.target.value })
                }
                disabled={!isAuthenticated}
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] uppercase">
              Technologies (separees par des virgules)
              <input
                className="bg-black border border-zinc-700 px-2 py-2 text-white"
                value={formState.technologies}
                onChange={(e) =>
                  setFormState({ ...formState, technologies: e.target.value })
                }
                required
                disabled={!isAuthenticated}
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] uppercase">
              Lien live
              <input
                className="bg-black border border-zinc-700 px-2 py-2 text-white"
                value={formState.liveUrl}
                onChange={(e) => setFormState({ ...formState, liveUrl: e.target.value })}
                required
                disabled={!isAuthenticated}
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] uppercase">
              Lien Github (optionnel)
              <input
                className="bg-black border border-zinc-700 px-2 py-2 text-white"
                value={formState.githubUrl}
                onChange={(e) => setFormState({ ...formState, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                disabled={!isAuthenticated}
              />
            </label>

            <label className="flex flex-col gap-1 text-[11px] uppercase">
              Image / thumbnail
              <input
                className="bg-black border border-zinc-700 px-2 py-2 text-white"
                value={formState.imageUrl}
                onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                disabled={!isAuthenticated}
              />
              <span className="text-[10px] text-zinc-500">
                Optionnel : utilise comme image de previsualisation; sinon capture auto du liveUrl.
              </span>
            </label>

            <div className="flex items-center justify-between text-[11px] uppercase">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formState.isHighlighted}
                  onChange={(e) =>
                    setFormState({ ...formState, isHighlighted: e.target.checked })
                  }
                  disabled={!isAuthenticated}
                />
                Mettre en avant
              </label>
              <label className="flex items-center gap-2">
                Ordre
                <input
                  type="number"
                  className="bg-black border border-zinc-700 px-2 py-1 text-white w-20"
                  value={formState.order}
                  onChange={(e) =>
                    setFormState({ ...formState, order: Number(e.target.value) })
                  }
                  required
                  disabled={!isAuthenticated}
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving || !isAuthenticated}
                className="border border-zinc-700 px-4 py-2 uppercase text-[11px] hover:bg-white hover:text-black transition-colors disabled:opacity-50"
              >
                {isSaving ? 'En cours...' : editingId ? 'Mettre a jour' : 'Creer'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-zinc-700 px-4 py-2 uppercase text-[11px] hover:bg-zinc-800 transition-colors"
                  disabled={!isAuthenticated}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
