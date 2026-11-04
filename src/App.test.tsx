import { RecoilRoot } from 'recoil';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Tabata timer with default settings', () => {
  render(
    <RecoilRoot>
      <App />
    </RecoilRoot>,
  );
  expect(screen.getByText('Tabata Timer')).toBeInTheDocument();
  expect(screen.getByText('READY')).toBeInTheDocument();
  expect(screen.getByText('Round 0/8')).toBeInTheDocument();
});
