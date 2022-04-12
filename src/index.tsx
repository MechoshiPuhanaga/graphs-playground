import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@styles/index.scss';

import App from './App';

const container = document.getElementById('app');

if (container) {
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
