import { FC } from 'react';

import TimerList from 'containers/TimerList';
import { I18nProvider } from 'i18n';

import './App.css';

const App: FC = () => (
  <I18nProvider>
    <div className="container">
      <TimerList />
    </div>
  </I18nProvider>
);

export default App;
