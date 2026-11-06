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
const landing = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'features', 'landing.json'), 'utf8'),
);
const en = locales.en;
const text = (lang, key) => locales[lang][key] || en[key];
const tpl = (str, params) =>
  str.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
const firstSentence = (str) => str.split(/(?<=[.。!！?？])\s*/)[0];
const presetName = (lang, p) => text(lang, `preset.${p.id}`);

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

const urlOf = (code, page) =>
  `${BASE_URL}/${code}/${page ? `${page.slug}/` : ''}`;
const FEATURES = ['about.feature1', 'about.feature2', 'about.feature3', 'about.feature4'];
const FAQ = [
  ['faq.q1', 'faq.a1'],
  ['faq.q2', 'faq.a2'],
  ['faq.q3', 'faq.a3'],
];

const alternates = (page) =>
  languages
    .map(
      (l) =>
        `<link rel="alternate" hreflang="${l.htmlLang}" href="${urlOf(
          l.code,
          page,
        )}" />`,
    )
    .concat(
      `<link rel="alternate" hreflang="x-default" href="${
        page ? urlOf('en', page) : `${BASE_URL}/`
      }" />`,
    )
    .join('');

/** Title / description for the home page of a language, or a preset page. */
const metaFor = (l, page) => {
  if (!page) {
    return {
      title: text(l.code, 'seo.title'),
      description: text(l.code, 'seo.description'),
    };
  }
  const name = presetName(l.code, page);

  return {
    title: tpl(text(l.code, 'seo.presetTitle'), { name }),
    description: tpl(text(l.code, 'seo.presetDescription'), {
      name,
      about: firstSentence(text(l.code, `preset.about.${page.id}`)),
    }),
  };
};

const headFor = (l, canonical, page) => {
  const { title, description } = metaFor(l, page);
  const image = page ? `${BASE_URL}/og/${page.id}.png` : OG_IMAGE;
  const others = languages
    .filter((o) => o.code !== l.code)
    .map((o) => `<meta property="og:locale:alternate" content="${o.ogLocale}" />`)
    .join('');
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: page ? `${presetName(l.code, page)} – ${APP_NAME}` : APP_NAME,
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
    alternates(page),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${APP_NAME}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:locale" content="${l.ogLocale}" />`,
    others,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="${TWITTER}" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    jsonLd(app),
    // The FAQ lives on the home pages only (no duplicate FAQ markup).
    page ? '' : jsonLd(faq),
  ].join('');
};

const bodyFor = (l, page) => {
  const t = (k) => esc(text(l.code, k));
  const langLinks = languages
    .map(
      (o) =>
        `<li><a href="/${o.code}/${page ? `${page.slug}/` : ''}" lang="${
          o.htmlLang
        }" hreflang="${o.htmlLang}">${esc(o.label)}</a></li>`,
    )
    .join('');
  const presetLinks = landing
    .map(
      (p) =>
        `<li><a href="/${l.code}/${p.slug}/">${p.emoji} ${esc(
          presetName(l.code, p),
        )}</a></li>`,
    )
    .join('');
  const intro = page
    ? `<h1>${esc(presetName(l.code, page))} – ${APP_NAME}</h1>` +
      `<p>${t(`preset.about.${page.id}`)}</p>`
    : `<h1>${APP_NAME}</h1><p>${t('seo.description')}</p>`;

  return (
    `<main class="seo-static">` +
    intro +
    `<h2>${t('about.title')}</h2>` +
    `<p>${t('about.intro')}</p>` +
    `<ul>${FEATURES.map((k) => `<li>${t(k)}</li>`).join('')}</ul>` +
    `<h2>${t('about.faqTitle')}</h2>` +
    FAQ.map(([q, a]) => `<h3>${t(q)}</h3><p>${t(a)}</p>`).join('') +
    `<nav aria-label="${t('about.presets')}"><ul>${presetLinks}</ul></nav>` +
    `<nav aria-label="${t('about.languages')}"><ul>${langLinks}</ul></nav>` +
    `</main>`
  );
};

const template = fs.readFileSync(path.join(BUILD, 'index.html'), 'utf8');
if (!template.includes('name="prerender-head"')) {
  throw new Error('prerender-head placeholder not found in build/index.html');
}

const render = (l, canonical, page) =>
  template
    .replace(/<html lang="[^"]*"/, `<html lang="${l.htmlLang}"`)
    .replace(/<title>.*?<\/title>/, () => `<title>${esc(metaFor(l, page).title)}</title>`)
    .replace(/<meta name="prerender-head"[^>]*>/, () => headFor(l, canonical, page))
    .replace('<div id="root"></div>', () => `<div id="root">${bodyFor(l, page)}</div>`);

const write = (relDir, html) => {
  const dir = path.join(BUILD, relDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
};

// One home page per language, plus one page per preset and language.
// "/" is the English x-default page.
languages.forEach((l) => {
  write(l.code, render(l, urlOf(l.code)));
  landing.forEach((p) =>
    write(`${l.code}/${p.slug}`, render(l, urlOf(l.code, p), p)),
  );
});
const defaultLang = languages.find((l) => l.code === 'en');
fs.writeFileSync(path.join(BUILD, 'index.html'), render(defaultLang, `${BASE_URL}/`));

// sitemap.xml with hreflang alternates
const today = new Date().toISOString().slice(0, 10);
const xhtmlFor = (page) =>
  languages
    .map(
      (l) =>
        `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${urlOf(
          l.code,
          page,
        )}"/>`,
    )
    .concat(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${
        page ? urlOf('en', page) : `${BASE_URL}/`
      }"/>`,
    )
    .join('\n');
const entries = [{ loc: `${BASE_URL}/`, page: null }];
languages.forEach((l) => {
  entries.push({ loc: urlOf(l.code), page: null });
  landing.forEach((p) => entries.push({ loc: urlOf(l.code, p), page: p }));
});
fs.writeFileSync(
  path.join(BUILD, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    entries
      .map(
        (e) =>
          `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${today}</lastmod>\n${xhtmlFor(
            e.page,
          )}\n  </url>`,
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
    '## Ready-made timers (English)',
    ...landing.map(
      (p) => `- [${presetName('en', p)}](${urlOf('en', p)}): ${en[`preset.about.${p.id}`]}`,
    ),
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
  `prerender: ${languages.length} home pages + ${
    languages.length * landing.length
  } preset pages, sitemap.xml and llms.txt written to build/`,
);
