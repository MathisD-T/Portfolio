import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const formattedIndex = (index + 1).toString().padStart(2, '0');
  const linkTarget = project.liveUrl || '';
  const hasLink = Boolean(linkTarget);
  const [fallbackIndex, setFallbackIndex] = React.useState(0);

  // Prefer explicit imageUrl, then try multiple public screenshot services to maximize chances of getting a visible preview.
  const previewCandidates = React.useMemo(() => {
    const list: (string | null)[] = [];
    if (project.imageUrl) list.push(project.imageUrl);
    if (project.liveUrl) {
      list.push(`https://image.thum.io/get/${encodeURIComponent(project.liveUrl)}`);
      list.push(`https://s.wordpress.com/mshots/v1/${encodeURIComponent(project.liveUrl)}?w=800`);
    }
    return list.filter(Boolean) as string[];
  }, [project.imageUrl, project.liveUrl]);

  const previewSrc = previewCandidates[fallbackIndex] ?? null;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    hasLink ? (
      <a
        href={linkTarget}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-3 cursor-pointer"
      >
        {children}
      </a>
    ) : (
      <div className="group flex flex-col gap-3 cursor-pointer">{children}</div>
    );

  return (
    <Wrapper>
      {/* Image Area - The 'Evidence' */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 z-10 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
        
        {/* The Scanline Effect - Subtle */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {previewSrc && fallbackIndex < previewCandidates.length ? (
          <img
            src={previewSrc}
            alt={project.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFallbackIndex((prev) => prev + 1)}
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.05] brightness-95 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 transition-all duration-700 ease-in-out"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-zinc-600 text-[11px] uppercase bg-zinc-950">
            No live preview
          </div>
        )}
        
        {/* Corner Markers */}
        <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Metadata - The 'File Info' */}
      <div className="flex justify-between items-start text-[10px] uppercase tracking-widest border-t border-transparent group-hover:border-zinc-800 pt-2 transition-colors">
        <div className="flex flex-col gap-1">
          <span className="text-white font-bold group-hover:text-green-500 transition-colors">
             {formattedIndex} // {project.title}
          </span>
          <span className="text-zinc-600 group-hover:text-zinc-400">
             {project.technologies.slice(0, 3).join(' + ')}
          </span>
        </div>
        <span className="text-zinc-700 group-hover:text-white transition-colors">
            SECURE_LINK &rarr;
        </span>
      </div>
    </Wrapper>
  );
};
