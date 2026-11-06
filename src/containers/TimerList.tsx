import { FC, useState } from 'react';
import { displayName, displayPreset, isIdle, TimerItem } from 'features/timers';
import TimerCard from 'components/organisms/TimerCard';
import Icon from 'components/atoms/Icon';
import ImportBanner from 'components/molecules/ImportBanner';
import PresetDialog from 'components/molecules/PresetDialog';
import TimerEditDialog from 'components/molecules/TimerEditDialog';
import ShareDialog from 'components/molecules/ShareDialog';
import Coffee from 'components/molecules/Coffee';
import Join from 'components/molecules/Join';
import { APP_NAME } from 'features/share';
import {
  buildSegments,
  formatTime,
  Settings,
  totalDuration,
} from 'features/tabata';
import { LANGS } from 'i18n/messages';
import AboutSection from 'components/organisms/AboutSection';
import { Lang, useI18n } from 'i18n';
import useTimers from './useTimers';

const TimerList: FC = () => {
  const {
    timers,
    now,
    muted,
    toggleMute,
    start,
    pause,
    reset,
    remove,
    add,
    edit,
    incoming,
    acceptIncoming,
    dismissIncoming,
  } = useTimers();
  const { t, lang, setLang } = useI18n();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  // Names of untouched timers follow the UI language.
  const view: TimerItem[] = timers.map((item) => ({
    ...item,
    name: displayName(item, t),
    presetName: displayPreset(item, t),
  }));
  const find = (id: string | null): TimerItem | undefined =>
    view.find((timer) => timer.id === id);
  const editing = find(editingId);
  const sharing = find(sharingId);

  let offer: { emoji: string; name: string; settings: Settings } | null = null;
  if (incoming?.kind === 'link') offer = incoming.timer;
  if (incoming?.kind === 'preset') {
    offer = {
      emoji: incoming.preset.emoji,
      name: t(`preset.${incoming.preset.id}`),
      settings: incoming.preset.settings,
    };
  }

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">
          <img
            className="app-logo"
            src="/logo192.png"
            alt=""
            width={28}
            height={28}
          />
          {APP_NAME}
        </h1>
        <select
          className="lang-select"
          aria-label={t('header.language')}
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code} lang={l.htmlLang}>
              {l.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="icon-button"
          aria-label={muted ? t('header.unmute') : t('header.mute')}
          aria-pressed={muted}
          onClick={toggleMute}
        >
          <Icon name={muted ? 'mute' : 'volume'} size={24} />
        </button>
      </header>

      {offer && (
        <ImportBanner
          emoji={offer.emoji}
          name={offer.name}
          total={formatTime(totalDuration(buildSegments(offer.settings)))}
          onAdd={acceptIncoming}
          onDismiss={dismissIncoming}
        />
      )}

      {timers.length === 0 && <p className="timer-empty">{t('list.empty')}</p>}
      <ul className="timer-list">
        {view.map((item) => (
          <TimerCard
            key={item.id}
            timer={item}
            now={now}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onRemove={remove}
            onEdit={setEditingId}
            onShare={setSharingId}
          />
        ))}
      </ul>
      <AboutSection />
      <footer className="timer-footer">
        <Coffee />
        <Join />
      </footer>
      <div className="timer-add-bar">
        <button
          type="button"
          className="timer-add"
          onClick={() => setAdding(true)}
        >
          <Icon name="add" size={22} />
          {t('list.add')}
        </button>
      </div>
      {editing && (
        <TimerEditDialog
          emoji={editing.emoji}
          name={editing.name}
          settings={editing.settings}
          locked={!isIdle(editing)}
          onSave={(values) => {
            edit(editing.id, values);
            setEditingId(null);
          }}
          onClose={() => setEditingId(null)}
        />
      )}
      {sharing && (
        <ShareDialog item={sharing} onClose={() => setSharingId(null)} />
      )}
      {adding && (
        <PresetDialog
          onSelect={(preset) => {
            add(preset);
            setAdding(false);
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
};

export default TimerList;
