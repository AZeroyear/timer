/* eslint-disable */
/**
 * Post-build step: turns build/index.html into one static HTML page per
 * language (build/<code>/index.html) plus sitemap.xml and llms.txt.
 *
 * The app itself is a client-side React SPA, but search engines and AI
 * crawlers often do not run JavaScript. Each language page therefore ships
 * with its own <title>, description, canonical / hreflang links, JSON-LD and
 * a plain-text copy of the About / FAQ content inside #root (React replaces it
 * on load). Texts come from src/i18n/locales/*.json, the same files the app uses.
 *
 * Usage: node scripts/prerender.js   (runs after `react-scripts build`)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const I18N = path.join(ROOT, 'src', 'i18n');

const BASE_URL = 'https://timer.eastazy.com';
const APP_NAME = 'Loopy Timer';
const TWITTER = '@FarEastAzy';
const OG_IMAGE = `${BASE_URL}/og-image.png`;

const languages = JSON.parse(
  fs.readFileSync(path.join(I18N, 'languages.json'), 'utf8'),
);
const locales = {};
languages.forEach((l) => {
  locales[l.code] = JSON.parse(
    fs.readFileSync(path.join(I18N, 'locales', `${l.code}.json`), 'utf8'),
  );
});
const en = locales.en;
const text = (lang, key) => locales[lang][key] || en[key];

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(
    /</g,
    '\\u003c',
  )}</script>`;

const urlOf = (code) => `${BASE_URL}/${code}/`;
const FEATURES = ['about.feature1', 'about.feature2', 'about.feature3', 'about.feature4'];
const FAQ = [
  ['faq.q1', 'faq.a1'],
  ['faq.q2', 'faq.a2'],
  ['faq.q3', 'faq.a3'],
];

const alternates = () =>
  languages
    .map(
      (l) =>
        `<link rel="alternate" hreflang="${l.htmlLang}" href="${urlOf(l.code)}" />`,
    )
    .concat(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />`)
    .join('');

const headFor = (l, canonical) => {
  const title = text(l.code, 'seo.title');
  const description = text(l.code, 'seo.description');
  const others = languages
    .filter((o) => o.code !== l.code)
    .map((o) => `<meta property="og:locale:alternate" content="${o.ogLocale}" />`)
    .join('');
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: APP_NAME,
    url: canonical,
    description,
    inLanguage: l.htmlLang,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: FEATURES.map((k) => text(l.code, k)),
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: l.htmlLang,
    mainEntity: FAQ.map(([q, a]) => ({
      '@type': 'Question',
      name: text(l.code, q),
      acceptedAnswer: { '@type': 'Answer', text: text(l.code, a) },
    })),
  };

  return [
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    alternates(),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${APP_NAME}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:locale" content="${l.ogLocale}" />`,
    others,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="${TWITTER}" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    jsonLd(app),
    jsonLd(faq),
  ].join('');
};

const bodyFor = (l) => {
  const t = (k) => esc(text(l.code, k));
  const langLinks = languages
    .map(
      (o) =>
        `<li><a href="/${o.code}/" lang="${o.htmlLang}" hreflang="${o.htmlLang}">${esc(
          o.label,
        )}</a></li>`,
    )
    .join('');

  return (
    `<main class="seo-static">` +
    `<h1>${APP_NAME}</h1>` +
    `<p>${t('seo.description')}</p>` +
    `<h2>${t('about.title')}</h2>` +
    `<p>${t('about.intro')}</p>` +
    `<ul>${FEATURES.map((k) => `<li>${t(k)}</li>`).join('')}</ul>` +
    `<h2>${t('about.faqTitle')}</h2>` +
    FAQ.map(([q, a]) => `<h3>${t(q)}</h3><p>${t(a)}</p>`).join('') +
    `<nav aria-label="${t('about.languages')}"><ul>${langLinks}</ul></nav>` +
    `</main>`
  );
};

const template = fs.readFileSync(path.join(BUILD, 'index.html'), 'utf8');
if (!template.includes('name="prerender-head"')) {
  throw new Error('prerender-head placeholder not found in build/index.html');
}

const render = (l, canonical) =>
  template
    .replace(/<html lang="[^"]*"/, `<html lang="${l.htmlLang}"`)
    .replace(/<title>.*?<\/title>/, `<title>${esc(text(l.code, 'seo.title'))}</title>`)
    .replace(/<meta name="prerender-head"[^>]*>/, () => headFor(l, canonical))
    .replace('<div id="root"></div>', () => `<div id="root">${bodyFor(l)}</div>`);

// One page per language; "/" is the English x-default page.
languages.forEach((l) => {
  const dir = path.join(BUILD, l.code);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(l, urlOf(l.code)));
});
const defaultLang = languages.find((l) => l.code === 'en');
fs.writeFileSync(path.join(BUILD, 'index.html'), render(defaultLang, `${BASE_URL}/`));

// sitemap.xml with hreflang alternates
const today = new Date().toISOString().slice(0, 10);
const xhtml = languages
  .map(
    (l) =>
      `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${urlOf(l.code)}"/>`,
  )
  .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/"/>`)
  .join('\n');
const urls = [`${BASE_URL}/`].concat(languages.map((l) => urlOf(l.code)));
fs.writeFileSync(
  path.join(BUILD, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n${xhtml}\n  </url>`,
      )
      .join('\n') +
    `\n</urlset>\n`,
);

// llms.txt: a short, plain description for AI assistants and crawlers.
fs.writeFileSync(
  path.join(BUILD, 'llms.txt'),
  [
    `# ${APP_NAME}`,
    '',
    `> ${en['seo.description']}`,
    '',
    en['about.intro'],
    '',
    '## Features',
    ...FEATURES.map((k) => `- ${en[k]}`),
    '',
    '## FAQ',
    ...FAQ.flatMap(([q, a]) => [`- ${en[q]} ${en[a]}`]),
    '',
    '## Pages (one per language)',
    ...languages.map((l) => `- [${l.label}](${urlOf(l.code)}): ${text(l.code, 'seo.title')}`),
    '',
    '## Other',
    `- [Sitemap](${BASE_URL}/sitemap.xml)`,
    '',
  ].join('\n'),
);

console.log(
  `prerender: ${languages.length} language pages, sitemap.xml and llms.txt written to build/`,
);
