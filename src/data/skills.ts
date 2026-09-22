export interface SkillGroup {
  name: string;
  note: string;
  items: string[];
}

/**
 * Grouped rather than scored. A percentage next to a language says
 * nothing a hiring manager can use, so the groups describe where each
 * tool sits in the work instead.
 */
export const skills: SkillGroup[] = [
  {
    name: 'Frontend',
    note: 'Where most of my client work happens',
    items: ['HTML', 'CSS', 'JavaScript', 'Astro'],
  },
  {
    name: 'Backend and data',
    note: 'For projects that need accounts, uploads or admin panels',
    items: ['PHP', 'MySQL', 'SQLite', 'XML'],
  },
  {
    name: 'Mobile',
    note: 'Native Android, from layout to release build',
    items: ['Android Studio', 'Java', 'Kotlin'],
  },
  {
    name: 'Tools and platforms',
    note: 'How the work gets shipped and kept online',
    items: ['Git and GitHub', 'Cloudflare', 'DNS and domains', 'Networking basics'],
  },
  {
    name: 'Design and content',
    note: 'What I bring to the marketing side of a project',
    items: ['UI design', 'Graphic design', 'Short form video', 'Social media content'],
  },
];
