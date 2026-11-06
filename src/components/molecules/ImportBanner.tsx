import { FC } from 'react';
import { useI18n } from 'i18n';

type Props = {
  emoji: string;
  name: string;
  total: string;
  onAdd: () => void;
  onDismiss: () => void;
};

/** Offers a timer from a shared link or a preset page; nothing is added unasked. */
const ImportBanner: FC<Props> = ({ emoji, name, total, onAdd, onDismiss }) => {
  const { t } = useI18n();

  return (
    <div className="import-banner" role="status">
      <p>
        <span aria-hidden>{emoji}</span> {t('import.prompt', { name, total })}
      </p>
      <div className="import-actions">
        <button type="button" className="import-dismiss" onClick={onDismiss}>
          {t('import.dismiss')}
        </button>
        <button type="button" className="import-add" onClick={onAdd}>
          {t('import.add')}
        </button>
      </div>
    </div>
  );
};

export default ImportBanner;
