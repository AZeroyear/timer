import { FC, MouseEvent } from 'react';
import { landingFromPath, LANDING } from 'features/presets';
import { Lang, useI18n } from 'i18n';
import { LANGS } from 'i18n/messages';

const FEATURES = [
  'about.feature1',
  'about.feature2',
  'about.feature3',
  'about.feature4',
] as const;

const FAQ = [
  ['faq.q1', 'faq.a1'],
  ['faq.q2', 'faq.a2'],
  ['faq.q3', 'faq.a3'],
] as const;

/**
 * Plain, crawlable text about the app. The same copy is pre-rendered into each
 * language's static HTML (scripts/prerender.js) for search and AI crawlers.
 */
const AboutSection: FC = () => {
  const { t, lang, setLang } = useI18n();
  const landing = landingFromPath(window.location.pathname);

  const choose = (e: MouseEvent<HTMLAnchorElement>, code: Lang) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setLang(code);
  };

  return (
    <section className="about" aria-label={t('about.title')}>
      {landing && (
        <div className="about-landing">
          <h2>{t(`preset.${landing.id}`)}</h2>
          <p>{t(`preset.about.${landing.id}`)}</p>
        </div>
      )}
      <details className="about-item">
        <summary>{t('about.title')}</summary>
        <div className="about-body">
          <p>{t('about.intro')}</p>
          <ul>
            {FEATURES.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
      </details>
      <details className="about-item">
        <summary>{t('about.faqTitle')}</summary>
        <div className="about-body">
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <h3>{t(q)}</h3>
              <p>{t(a)}</p>
            </div>
          ))}
        </div>
      </details>
      <details className="about-item">
        <summary>{t('about.presets')}</summary>
        <nav className="about-body" aria-label={t('about.presets')}>
          <ul className="about-langs">
            {LANDING.map((l) => (
              <li key={l.id}>
                <a href={`/${lang}/${l.slug}/`}>
                  {l.emoji} {t(`preset.${l.id}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </details>
      <details className="about-item">
        <summary>{t('about.languages')}</summary>
        <nav className="about-body" aria-label={t('about.languages')}>
          <ul className="about-langs">
            {LANGS.map((l) => (
              <li key={l.code}>
                <a
                  href={`/${l.code}/${landing ? `${landing.slug}/` : ''}`}
                  lang={l.htmlLang}
                  hrefLang={l.htmlLang}
                  onClick={(e) => choose(e, l.code)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </section>
  );
};

export default AboutSection;
