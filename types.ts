export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  technologies: string[];
  liveUrl: string;
  githubUrl?: string;
  imageUrl?: string;
  isHighlighted: boolean;
  order: number;
}

export type ProjectInput = Omit<Project, 'id'>;

export interface Skill {
  name: string;
  level: number; // 0 to 100
  category: 'frontend' | 'backend' | 'tools';
}
