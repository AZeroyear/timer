import { FC } from "react";

import CounterBoard from "containers/organisms/CounterBoard";

import "./App.css";

const App: FC = () => (
  <div className="container">
    <header>
      <h1>Pomodoro Timer</h1>
    </header>
    <CounterBoard />
  </div>
);

export default App;
