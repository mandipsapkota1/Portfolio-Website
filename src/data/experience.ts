export interface Role {
  period: string;
  title: string;
  org: string;
  place: string;
  current?: boolean;
  points: string[];
}

export interface School {
  period: string;
  title: string;
  org: string;
  place?: string;
  note?: string;
}

/** Newest first. Periods are written out in words, never with dashes. */
export const roles: Role[] = [
  {
    period: '2026 to present',
    title: 'Social Media Management',
    org: 'Oasis Education',
    place: 'Chitwan, Nepal',
    current: true,
    points: [
      'Plan and run the consultancy’s social channels, from the content calendar to the posts that go out each week.',
      'Produce short form video, branch promos and campaign creatives for the Kathmandu, Chitwan and Butwal offices.',
      'Keep the messaging in step with intake dates and counselling events so enquiries land when the team can act on them.',
    ],
  },
  {
    period: '2025 to 2026',
    title: 'Assistant Application Developer',
    org: 'Maulakalika Networks Pvt Ltd',
    place: 'Gaindakot, Nawalpur',
    points: [
      'Designed, built and maintained web and mobile applications, taking features from requirements through to deployment.',
      'Worked with the wider team on performance, code standards and the overall architecture of the products.',
      'Joined in February 2025 as an intern for three months and moved into the full role in May.',
    ],
  },
  {
    period: 'Sep to Dec 2024',
    title: 'Frontend and Mobile App Developer',
    org: 'Tivra Institute of IT Training Center',
    place: 'Bharatpur, Chitwan',
    points: [
      'Built responsive interfaces for web and mobile projects and tested components before release.',
      'Fixed bugs and prepared project documentation alongside the senior developers.',
    ],
  },
  {
    period: '2023 to present',
    title: 'Freelance Full Stack and Mobile App Developer',
    org: 'Self employed',
    place: 'Nepal',
    points: [
      'Websites and Android apps for small businesses, including the Helios Talent, ReadyStack Digital and Narendra Dairy Farm sites.',
      'Handle the whole job: design, build, domain and DNS, hosting on Cloudflare, and the updates that follow.',
    ],
  },
];

export const education: School[] = [
  {
    period: '2022 to 2025',
    title: 'BSc Information Technology',
    org: 'ISMT College',
    place: 'Kathmandu',
    note: 'International School of Management and Technology. Coursework in programming, databases, system analysis and cybersecurity.',
  },
  {
    period: '2017 to 2019',
    title: 'Higher Secondary (+2), NEB',
    org: 'Aroma College',
    place: 'Nepal',
  },
  {
    period: '2006 to 2017',
    title: 'Secondary Education',
    org: 'Vijaya Samudayik Shiksha Sadan',
    place: 'Nepal',
  },
];

export const certifications: School[] = [
  {
    period: '2025',
    title: 'Cybersecurity Terminology',
    org: 'LinkedIn Learning',
  },
];

export const languages = ['Nepali', 'English', 'Hindi'];
