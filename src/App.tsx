import { FC } from 'react';

import TabataTimer from 'containers/TabataTimer';

import './App.css';

const App: FC = () => (
  <div className="container">
    <header>
      <h1 className="title">Tabata Timer</h1>
    </header>
    <TabataTimer />
  </div>
);

export default App;
