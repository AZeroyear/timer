import { FC } from 'react';
import { useI18n } from 'i18n';
import { ReactComponent as Twitter } from 'images/twitter.svg';
import { ReactComponent as Discord } from 'images/Discord.svg';

const Join: FC = () => {
  const { t } = useI18n();

  return (
    <div style={{ fontSize: 10, marginTop: 30 }}>
      <p className="m-0">{t('footer.follow')}</p>
      <div className="flex-center" style={{ height: 42 }}>
        <a
          href="https://twitter.com/FarEastAzy"
          target="_blank"
          rel="noreferrer"
        >
          <Twitter className="icon" style={{ fill: '#1da1f2' }} />
        </a>
        <a
          href="https://discord.gg/jwEBEynSZx"
          target="_blank"
          rel="noreferrer"
        >
          <Discord width={24} />
        </a>
      </div>
    </div>
  );
};

export default Join;
