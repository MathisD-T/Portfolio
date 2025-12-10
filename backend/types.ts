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

export type ProjectInput = Omit<Project, 'id'> & { id?: string };
