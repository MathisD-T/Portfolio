import React, { useEffect, useState } from 'react';
import { ProjectCard } from './components/ProjectCard';
import { SKILLS, MY_NAME, MY_ROLE } from './constants';
import { Project } from './types';
import { AdminPage } from './components/AdminPage';

const App: React.FC = () => {
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdminRoute) return;
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      setProjectError(null);
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) {
          throw new Error(`Erreur serveur (${res.status})`);
        }
        const data: Project[] = await res.json();
        const sorted = [...data].sort(
          (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
        );
        setProjects(sorted);
      } catch (error) {
        console.error(error);
        setProjectError("Impossible de charger les projets pour le moment.");
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [isAdminRoute]);

  const projectCountLabel = projects.length.toString().padStart(2, '0');

  if (isAdminRoute) {
    return <AdminPage />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-mono text-xs selection:bg-white selection:text-black p-4 md:p-8">
      
      {/* Identity Block - Raw Data */}
      <header className="mb-16 md:mb-24 flex flex-col md:flex-row md:justify-between items-start gap-4 md:gap-0 uppercase tracking-widest border-l border-zinc-800 pl-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-white font-bold">{MY_NAME}</h1>
          <span>ROLE: {MY_ROLE}</span>
          <span>LOC: QUÉBEC_CA</span>
        </div>
        <div className="flex flex-col gap-1 text-right md:text-right text-left">
          <a href="mailto:mathisdesgagne@gmail.com" className="hover:text-white hover:underline decoration-1 underline-offset-4">
            mathisdesgagne@gmail.com
          </a>
          <span>STATUS: OPEN_FOR_OPS</span>
          <span>ENC: V.2.5</span>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto">
        
        {/* Projects Grid - The Evidence Board */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-6 border-b border-zinc-900 pb-2">
            <span className="uppercase tracking-widest text-[10px] text-zinc-600">
              [ EVIDENCE_LOG // PROJECTS ]
            </span>
            <span className="text-[10px] text-zinc-600">
              COUNT: {projectCountLabel}
            </span>
          </div>

          {isLoadingProjects && (
            <div className="text-zinc-600 uppercase tracking-widest">Loading projects...</div>
          )}

          {projectError && (
            <div className="text-red-500 uppercase tracking-widest">{projectError}</div>
          )}

          {!isLoadingProjects && !projectError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Skills - Raw String */}
        <section className="border-t border-zinc-900 pt-4 flex flex-col md:flex-row gap-4 md:gap-12 text-[10px] uppercase tracking-widest text-zinc-600">
            <span>[ SYSTEM_CAPABILITIES ]</span>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-zinc-400">
                {SKILLS.map(skill => (
                    <span key={skill.name} className="hover:text-white transition-colors cursor-crosshair">
                        {skill.name}::{skill.level}
                    </span>
                ))}
            </div>
        </section>

      </main>
    </div>
  );
};

export default App;
