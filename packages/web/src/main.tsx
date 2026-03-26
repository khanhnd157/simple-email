import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@desktop/i18n';
import '@desktop/index.css';

import { App } from '@desktop/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
