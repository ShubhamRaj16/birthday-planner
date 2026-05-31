interface RouteMeta {
  title: string;
  description: string;
  robots?: string;
  image?: string;
  type?: string;
  url?: string;
}

interface DefaultMeta {
  title: string;
  description: string;
  image: string;
  type: string;
}

const defaultMeta: DefaultMeta = {
  title: 'Birthday Planner',
  description: 'Local-first birthday party planner for kids',
  image: 'https://example.com/og-image.jpg',
  type: 'website',
};

const routeMeta: Record<string, Partial<RouteMeta>> = {
  '/': {
    title: 'Dashboard | Birthday Planner',
    description: 'Overview of upcoming birthdays and events.',
  },
  '/children': {
    title: 'Children | Birthday Planner',
    description: 'Manage child profiles and birthday information.',
  },
  '/events': {
    title: 'Events | Birthday Planner',
    description: 'Plan and manage birthday party events.',
  },
  '/calendar': {
    title: 'Calendar | Birthday Planner',
    description: 'View birthdays and events on a monthly calendar.',
  },
  '/reminders': {
    title: 'Reminders | Birthday Planner',
    description: 'In-app reminders for your birthday planning tasks.',
  },
  '*': {
    title: 'Page Not Found | Birthday Planner',
    description: 'The requested page could not be found.',
    robots: 'noindex',
  },
};

function escape(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateHeadTags(pathname: string, absoluteUrl: string): string {
  // Match exact path or fall back to wildcard
  const route = routeMeta[pathname] || routeMeta['*'];
  const meta = { ...defaultMeta, ...route, url: absoluteUrl } as RouteMeta & DefaultMeta;

  return `
    <title>${escape(meta.title)}</title>
    <link rel="canonical" href="${escape(meta.url)}">
    <meta name="description" content="${escape(meta.description)}">
    ${meta.robots ? `<meta name="robots" content="${escape(meta.robots)}">` : ''}
    <meta property="og:title" content="${escape(meta.title)}">
    <meta property="og:description" content="${escape(meta.description)}">
    <meta property="og:image" content="${escape(meta.image)}">
    <meta property="og:url" content="${escape(meta.url)}">
    <meta property="og:type" content="${escape(meta.type)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escape(meta.title)}">
    <meta name="twitter:description" content="${escape(meta.description)}">
    <meta name="twitter:image" content="${escape(meta.image)}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8">
  `;
}
