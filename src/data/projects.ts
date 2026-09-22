import type { ImageMetadata } from 'astro';
import helios   from '../assets/work/helios.jpg';
import ready    from '../assets/work/readystack.jpg';
import dairy    from '../assets/work/narendra-dairy.jpg';
import self     from '../assets/work/portfolio.jpg';

export interface Featured {
  slug: string;
  name: string;
  kicker: string;
  summary: string;
  detail: string;
  tags: string[];
  image: ImageMetadata;
  imageAlt: string;
  live?: string;
  code?: string;
  /** Renders a button that opens the on-site assistant instead of a link. */
  assistant?: boolean;
}

export interface Project {
  name: string;
  summary: string;
  tags: string[];
  live?: string;
  code?: string;
}

/**
 * Case studies with a real screenshot. Screenshots live in src/assets/work
 * and are resized by Astro at build time.
 */
export const featured: Featured[] = [
  {
    slug: 'helios-talent',
    name: 'Helios Talent',
    kicker: 'Recruitment agency website, Sydney',
    summary:
      'Marketing site for an Australian recruitment agency that places blue collar, IT and professional staff nationwide.',
    detail:
      'Built in Astro and served through Cloudflare. Service pages by industry, three hiring models, a registration path for job seekers and an enquiry form for employers, all on a single fast page structure.',
    tags: ['Astro', 'Cloudflare', 'Client work', 'Australia'],
    image: helios,
    imageAlt: 'Home page of heliostalent.com.au with the headline Smarter Workforce Solutions',
    live: 'https://heliostalent.com.au/',
  },
  {
    slug: 'readystack-digital',
    name: 'ReadyStack Digital',
    kicker: 'Agency website and content, Australia',
    summary:
      'Website for an agency that builds and looks after sites for Australian small businesses, with packages, industries, a how it works flow and a blog.',
    detail:
      'Multi page Astro build with plain CSS, per page SEO and structured data. I also produce the agency’s short form video content, so the site and the social channels speak with one voice.',
    tags: ['Astro', 'SEO', 'Video content', 'Australia'],
    image: ready,
    imageAlt: 'Home page of readystackdigital.com',
    live: 'https://readystackdigital.com/',
  },
  {
    slug: 'narendra-dairy-farm',
    name: 'Narendra Dairy Farm',
    kicker: 'Bilingual brochure site, Gaindakot',
    summary:
      'Five page site for a family dairy farm in Nawalpur: services, products, gallery and contact, in English with Nepali script throughout.',
    detail:
      'WhatsApp and phone are the ordering path instead of a checkout, which suits how the farm actually sells. Content sits in plain TypeScript files so updates stay simple for a non technical owner.',
    tags: ['Astro', 'Bilingual', 'Local business', 'Nepal'],
    image: dairy,
    imageAlt: 'Home page of the Narendra Dairy Farm website',
    code: 'https://github.com/mandipsapkota1/narendra-dairy',
  },
  {
    slug: 'this-site',
    name: 'This site and its assistant',
    kicker: 'Portfolio with a voice and chat assistant',
    summary:
      'The page you are reading: a static Astro build deployed from GitHub by a Cloudflare Worker, with an AI assistant that answers questions about my work by chat or live voice call.',
    detail:
      'The assistant is embedded as a sandboxed iframe rather than a third party script, so it cannot touch the page, and nothing loads from its provider until someone opens it. Every conversation is summarised to my inbox.',
    tags: ['Astro', 'Cloudflare Workers', 'OmniDimension', 'Voice AI'],
    image: self,
    imageAlt: 'The home page of this portfolio',
    code: 'https://github.com/mandipsapkota1/Portfolio-Website',
    assistant: true,
  },
];

/** Smaller pieces of work, shown as a compact list under the case studies. */
export const projects: Project[] = [
  {
    name: 'Assignment Helper',
    summary:
      'Full stack platform where students upload assignments and track progress, with an admin panel, authentication and email notifications through PHPMailer.',
    tags: ['PHP', 'MySQL', 'PHPMailer'],
    code: 'https://github.com/mandipsapkota1/Assignment-Helper',
  },
  {
    name: 'Property Rental System',
    summary:
      'Rental management for listings, tenants, payments and leases. MongoDB holds the flexible property records and SQL the structured data.',
    tags: ['JavaScript', 'MongoDB', 'SQL'],
    code: 'https://github.com/mandipsapkota1/Property-Rental-System',
  },
  {
    name: 'Secure Login System',
    summary:
      'Login and signup flow built around input validation, password rules, session handling and SQL backed storage, made for a cybersecurity module.',
    tags: ['PHP', 'SQL', 'Security'],
    code: 'https://github.com/mandipsapkota1/Login-Signup',
  },
  {
    name: 'MealMate',
    summary:
      'Android app for exploring and organising food products, with straightforward navigation and simple meal planning.',
    tags: ['Android Studio', 'Java'],
    code: 'https://github.com/mandipsapkota1/MealMate',
  },
  {
    name: 'Suitcase App',
    summary:
      'Android app that helps travellers organise what to pack, built in Java with Android Studio.',
    tags: ['Android Studio', 'Java'],
    code: 'https://github.com/mandipsapkota1/Suitcase-App',
  },
  {
    name: 'Snap Streak',
    summary:
      'One tap arcade game drawn on a canvas, with a score card that shares straight to Snapchat. A weekend project that people actually play.',
    tags: ['JavaScript', 'Canvas', 'Game'],
    live: 'https://feisty-magnet-410.higgsfield.app/',
  },
];
