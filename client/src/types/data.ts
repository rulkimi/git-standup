export interface Repository {
  name: string;
  owner: string;
  private: boolean;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: 
    | "TypeScript"
    | "Jupyter Notebook"
    | "Python"
    | "PHP"
    | "HTML"
    | "C++"
    | "Vue"
    | "GDScript"
    | "JavaScript"
    | null
    | string;
  forked: boolean;
  forked_from: string | null;
};