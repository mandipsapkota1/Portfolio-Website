/**
 * Facts about the person the site is about. Every component reads from
 * here, so a change of phone number or job title is a one line edit.
 */
export const site = {
  name: 'Mandip Sapkota',
  role: 'Frontend and mobile app developer',
  location: 'Gaindakot, Nepal',
  country: 'Nepal',
  email: 'info@mandipsapkota.com.np',
  phone: '+977 9840318084',
  phoneHref: 'tel:+9779840318084',
  url: 'https://mandipsapkota.com.np',
  cv: '/cv/Mandip-Sapkota-CV.pdf',
  cvFilename: 'Mandip-Sapkota-CV.pdf',

  title: 'Mandip Sapkota, frontend and mobile app developer in Nepal',
  description:
    'Frontend and mobile app developer based in Nepal. I build fast websites in Astro and Android apps for small businesses in Nepal and Australia.',

  socials: [
    { label: 'GitHub',   href: 'https://github.com/mandipsapkota1',                       icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mandip-sapkota-86578937a/',   icon: 'linkedin' },
    { label: 'Facebook', href: 'https://www.facebook.com/mandip.sapkota123',              icon: 'facebook' },
  ],

  nav: [
    { label: 'About',      href: '#about' },
    { label: 'Work',       href: '#work' },
    { label: 'Experience', href: '#experience' },
    { label: 'Toolkit',    href: '#toolkit' },
    { label: 'Contact',    href: '#contact' },
  ],
} as const;
