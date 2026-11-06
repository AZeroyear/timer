import { FC, useEffect, useState } from 'react';
import Icon from 'components/atoms/Icon';
import { loadStats, summarize } from 'features/stats';
import { useI18n } from 'i18n';
import {
  APP_NAME,
  APP_URL,
  buildShareText,
  renderShareImage,
  Shareable,
  tweetUrl,
} from 'features/share';

type Props = {
  item: Shareable;
  onClose: () => void;
};

const fileName = (name: string): string =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'timer'}-done.png`;

const ShareDialog: FC<Props> = ({ item, onClose }) => {
  const { t, lang } = useI18n();
  const [summary] = useState(() => summarize(loadStats()));
  const text = buildShareText(item, t, summary);
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [notice, setNotice] = useState('');
  const canShare = typeof navigator.share === 'function';

  useEffect(() => {
    let url = '';
    let cancelled = false;
    renderShareImage(item, t, summary)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ blob, url });
      })
      .catch(() => setImage(null));

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, lang]);

  const nativeShare = async () => {
    try {
      const file = image
        ? new File([image.blob], fileName(item.name), { type: 'image/png' })
        : null;
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
      } else {
        await navigator.share({ text, url: APP_URL });
      }
    } catch {
      // The user dismissed the share sheet.
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${APP_URL}`);
      setNotice(t('share.copied'));
    } catch {
      setNotice(t('share.copyFail'));
    }
  };

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('card.share')}
      >
        <h2 className="dialog-title">{t('share.title')}</h2>

        <div className="share-preview">
          {image ? (
            <img
              src={image.url}
              alt={t('share.imageAlt', { name: item.name })}
            />
          ) : (
            <div className="share-preview-empty" />
          )}
        </div>
        <p className="share-text">{text}</p>

        <div className="share-actions">
          <a
            className="share-button share-x"
            href={tweetUrl(text)}
            target="_blank"
            rel="noreferrer"
          >
            {t('share.post')}
          </a>
          {canShare && (
            <button
              type="button"
              className="share-button share-native"
              onClick={() => void nativeShare()}
            >
              <Icon name="share" size={18} />
              {t('share.native')}
            </button>
          )}
          {image && (
            <a
              className="share-button"
              href={image.url}
              download={fileName(item.name)}
            >
              {t('share.save')}
            </a>
          )}
          <button
            type="button"
            className="share-button"
            onClick={() => void copy()}
          >
            {t('share.copy')}
          </button>
        </div>
        <p className="share-hint" aria-live="polite">
          {notice || `${t('share.hint')} ${APP_NAME}.`}
        </p>

        <button type="button" className="dialog-cancel" onClick={onClose}>
          {t('dialog.close')}
        </button>
      </div>
    </div>
  );
};

export default ShareDialog;
