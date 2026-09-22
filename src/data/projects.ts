import type { ImageMetadata } from 'astro';
import helios      from '../assets/work/helios.jpg';
import ready       from '../assets/work/readystack.jpg';
import dairy       from '../assets/work/narendra-dairy.jpg';
import assignment  from '../assets/work/assignment-helper.jpg';
import veil        from '../assets/work/veil.jpg';
import stackIt     from '../assets/work/stack-it.jpg';
import jumping     from '../assets/work/snap-jumping.jpg';
import snapStreak  from '../assets/work/snap-streak.jpg';
import self        from '../assets/work/portfolio.jpg';

export type Category = 'site' | 'app' | 'game';

export const categories: Record<Category, string> = {
  site: 'Websites',
  app:  'Web apps',
  game: 'Games',
};

export interface Project {
  slug: string;
  name: string;
  category: Category;
  /** Short label shown above the title, e.g. "Recruitment agency website". */
  kind: string;
  summary: string;
  tags: string[];
  image: ImageMetadata;
  imageAlt: string;
  /** The working project. Cards link here and nowhere else. */
  live?: string;
  /** Label for the live link, defaults to "View live site". */
  liveLabel?: string;
  /** Shown instead of a link when the project has no public URL yet. */
  status?: string;
  /** Opens the on-site assistant instead of following a link. */
  assistant?: boolean;
}

/**
 * Every card links to the working project where one is public. Source code
 * is deliberately not linked from the site.
 */
export const projects: Project[] = [
  {
    slug: 'helios-talent',
    name: 'Helios Talent',
    category: 'site',
    kind: 'Recruitment agency website',
    summary:
      'Marketing site for a Sydney recruitment agency: services by industry, three hiring models, a job seeker registration path and an employer enquiry form, built in Astro and served through Cloudflare.',
    tags: ['Astro', 'Cloudflare', 'Australia'],
    image: helios,
    imageAlt: 'Home page of heliostalent.com.au with the headline Smarter Workforce Solutions',
    live: 'https://heliostalent.com.au/',
  },
  {
    slug: 'readystack-digital',
    name: 'ReadyStack Digital',
    category: 'site',
    kind: 'Agency website and content',
    summary:
      'Multi page site for an agency that builds and looks after websites for Australian small businesses, with packages, industries, a how it works flow and a blog. I also produce its short form video content.',
    tags: ['Astro', 'SEO', 'Video content'],
    image: ready,
    imageAlt: 'Home page of readystackdigital.com',
    live: 'https://readystackdigital.com/',
  },
  {
    slug: 'narendra-dairy-farm',
    name: 'Narendra Dairy Farm',
    category: 'site',
    kind: 'Bilingual brochure website',
    summary:
      'Five page site for a family dairy farm in Nawalpur: services, products, gallery and contact, in English with Nepali script throughout. WhatsApp and phone are the ordering path instead of a checkout.',
    tags: ['Astro', 'Bilingual', 'Local business'],
    image: dairy,
    imageAlt: 'Home page of the Narendra Dairy Farm website',
    live: 'https://narendra-dairy.pages.dev/',
  },
  {
    slug: 'assignment-helper',
    name: 'Assignment Helper',
    category: 'app',
    kind: 'Academic support platform',
    summary:
      'Full stack platform where students upload assignments and track progress, with accounts, an admin panel and email notifications through PHPMailer. PHP and MySQL behind a fast single page front end.',
    tags: ['PHP', 'MySQL', 'PHPMailer'],
    image: assignment,
    imageAlt: 'Home page of the Assignment Helper platform',
    live: 'https://assignmenthelper.42web.io/?i=1',
    liveLabel: 'View live project',
  },
  {
    slug: 'veil',
    name: 'Veil',
    category: 'game',
    kind: 'One thumb timing game',
    summary:
      'A shard of light runs down a track, crosses into the dark and has to be struck from memory. Sixty marks, three acts, a miss ends the run. Built as a web prototype to tune the difficulty before the Snapchat Lens.',
    tags: ['JavaScript', 'Canvas', 'Game design'],
    image: veil,
    imageAlt: 'Title screen of Veil on a phone',
    live: '/play/veil/',
    liveLabel: 'Play in the browser',
  },
  {
    slug: 'stack-it',
    name: 'Stack It',
    category: 'game',
    kind: 'Snapchat Lens game',
    summary:
      'One touch precision stacking for Lens Studio. Tap to drop the moving block, keep what overlaps, lose the rest. Thirty stages across three difficulty phases, with the simulation kept separate from the Lens rendering.',
    tags: ['Lens Studio', 'JavaScript', 'Snapchat'],
    image: stackIt,
    imageAlt: 'Stack It icon, a tower of coloured blocks',
    status: 'Built in Lens Studio for Snapchat',
  },
  {
    slug: 'snap-jumping',
    name: 'Snap Jumping',
    category: 'game',
    kind: 'Snapchat Lens game',
    summary:
      'Who Jumps Highest?, a competitive jumping game for Lens Studio. Pick one of three champions, the other two become AI rivals, and the highest jumper over five rounds wins. Anchor driven layout that adapts to any phone.',
    tags: ['Lens Studio', 'JavaScript', 'Snapchat'],
    image: jumping,
    imageAlt: 'Snap Jumping icon, a character mid jump',
    status: 'Built in Lens Studio for Snapchat',
  },
  {
    slug: 'snap-streak',
    name: 'Snap Streak',
    category: 'game',
    kind: 'Browser arcade game',
    summary:
      'One tap arcade game drawn on a canvas. A spark orbits a ring, one tap releases it to latch onto the next, and the streak is the score. Shares a score card straight to Snapchat.',
    tags: ['JavaScript', 'Canvas', 'Web Share API'],
    image: snapStreak,
    imageAlt: 'Snap Streak title screen',
    live: 'https://feisty-magnet-410.higgsfield.app/',
    liveLabel: 'Play in the browser',
  },
  {
    slug: 'this-site',
    name: 'This site and its assistant',
    category: 'site',
    kind: 'Portfolio with a voice and chat assistant',
    summary:
      'A static Astro build deployed from GitHub by a Cloudflare Worker, with an assistant that answers questions about my work by chat or live voice call. Embedded as a sandboxed iframe, so nothing loads until you open it.',
    tags: ['Astro', 'Cloudflare Workers', 'Voice AI'],
    image: self,
    imageAlt: 'The home page of this portfolio',
    assistant: true,
  },
];

export interface OtherWork {
  name: string;
  kind: string;
  summary: string;
  tags: string[];
}

/** Coursework and smaller builds that are not deployed anywhere public. */
export const otherWork: OtherWork[] = [
  {
    name: 'Property Rental System',
    kind: 'Web app',
    summary: 'Rental management for listings, tenants, payments and leases. MongoDB holds the flexible property records and SQL the structured data.',
    tags: ['JavaScript', 'MongoDB', 'SQL'],
  },
  {
    name: 'Secure Login System',
    kind: 'Web app',
    summary: 'Login and signup flow built around input validation, password rules, session handling and SQL backed storage, made for a cybersecurity module.',
    tags: ['PHP', 'SQL', 'Security'],
  },
  {
    name: 'MealMate',
    kind: 'Android app',
    summary: 'Android app for exploring and organising food products, with straightforward navigation and simple meal planning.',
    tags: ['Android Studio', 'Java'],
  },
  {
    name: 'Suitcase App',
    kind: 'Android app',
    summary: 'Android app that helps travellers organise what to pack, built in Java with Android Studio.',
    tags: ['Android Studio', 'Java'],
  },
];
