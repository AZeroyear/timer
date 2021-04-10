import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';

import { CookiesProvider } from 'react-cookie';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

ReactDOM.render(
  <RecoilRoot>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </RecoilRoot>,
  document.getElementById('root'),
);

reportWebVitals();
