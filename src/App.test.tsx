import { RecoilRoot } from 'recoil';
import { fireEvent, render, screen } from '@testing-library/react';
import { defaultSettings } from 'features/tabata';
import { MUTE_KEY, STORAGE_KEY } from 'features/timers';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

const renderApp = () =>
  render(
    <RecoilRoot>
      <App />
    </RecoilRoot>,
  );

test('renders the timer list with one default timer', () => {
  renderApp();
  expect(screen.getByText('Loopy Timer')).toBeInTheDocument();
  expect(screen.getByLabelText('Start Pomodoro')).toBeInTheDocument();
});

test('adds a timer from the preset dialog and removes it', () => {
  renderApp();
  fireEvent.click(screen.getByText('Add timer'));
  fireEvent.click(screen.getByText('Tabata'));
  expect(screen.getByLabelText('Start Tabata')).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Delete Tabata'));
  expect(screen.queryByLabelText('Start Tabata')).not.toBeInTheDocument();
});

test('timers start independently', () => {
  renderApp();
  fireEvent.click(screen.getByText('Add timer'));
  fireEvent.click(screen.getByText('Tabata'));
  fireEvent.click(screen.getByLabelText('Start Pomodoro'));
  expect(screen.getByLabelText('Pause Pomodoro')).toBeInTheDocument();
  expect(screen.getByLabelText('Start Tabata')).toBeInTheDocument();
});

test('edits name and cycle settings from the settings dialog', () => {
  renderApp();
  fireEvent.click(screen.getByLabelText('Settings Pomodoro'));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Morning' },
  });
  fireEvent.change(screen.getByLabelText(/Rounds/), {
    target: { value: '3' },
  });
  fireEvent.click(screen.getByText('Save'));
  expect(screen.getByLabelText('Start Morning')).toBeInTheDocument();
  expect(screen.getByText(/Round 1\/3/)).toBeInTheDocument();
});

test('locks cycle fields while the timer is running', () => {
  renderApp();
  fireEvent.click(screen.getByLabelText('Start Pomodoro'));
  fireEvent.click(screen.getByLabelText('Settings Pomodoro'));
  expect(screen.getByLabelText(/Rounds/)).toBeDisabled();
  expect(screen.getByLabelText('Name')).not.toBeDisabled();
});

test('restores timers after a reload', () => {
  const first = renderApp();
  fireEvent.click(screen.getByText('Add timer'));
  fireEvent.click(screen.getByText('HIIT'));
  first.unmount();
  renderApp();
  expect(screen.getByLabelText('Start Pomodoro')).toBeInTheDocument();
  expect(screen.getByLabelText('Start HIIT')).toBeInTheDocument();
});

test('a timer that ran out while the page was closed shows as done and can be shared', () => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      timers: [
        {
          id: 'a',
          emoji: '🍅',
          name: 'Pomodoro',
          presetName: 'Pomodoro',
          settings: defaultSettings,
          run: {
            running: true,
            startedAt: Date.now() - 3600 * 1000,
            accumulated: 0,
          },
        },
      ],
    }),
  );
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  renderApp();
  expect(screen.getByText('DONE')).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Share Pomodoro'));
  expect(
    screen.getByRole('dialog', { name: 'Share result' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Post to X')).toHaveAttribute(
    'href',
    expect.stringContaining('twitter.com/intent/tweet'),
  );
});

test('mute toggle', () => {
  renderApp();
  fireEvent.click(screen.getByLabelText('Mute sounds'));
  expect(screen.getByLabelText('Unmute sounds')).toBeInTheDocument();
  expect(window.localStorage.getItem(MUTE_KEY)).toBe('1');
});

test('switches the UI language, updates the URL and remembers it', () => {
  const first = renderApp();
  expect(window.location.pathname).toBe('/en/');
  fireEvent.change(screen.getByLabelText('Language'), {
    target: { value: 'ja' },
  });
  expect(screen.getByLabelText('Pomodoroを開始')).toBeInTheDocument();
  expect(screen.getByText('タイマーを追加')).toBeInTheDocument();
  expect(document.documentElement.lang).toBe('ja');
  expect(window.location.pathname).toBe('/ja/');
  first.unmount();
  window.history.replaceState(null, '', '/');
  renderApp();
  expect(screen.getByText('タイマーを追加')).toBeInTheDocument();
  expect(window.location.pathname).toBe('/ja/');
});

test('the URL decides the language', () => {
  window.history.replaceState(null, '', '/es/');
  renderApp();
  expect(screen.getByText('Añadir temporizador')).toBeInTheDocument();
  expect(document.documentElement.lang).toBe('es');
});

test('renders the About / FAQ text and a link for every language', () => {
  renderApp();
  expect(screen.getByText('Is Loopy Timer free?')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Deutsch/ })[0]).toHaveAttribute(
    'href',
    '/de/',
  );
});
