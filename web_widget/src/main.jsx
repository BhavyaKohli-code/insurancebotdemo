import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './ChatWidget.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatWidget />
  </StrictMode>
);
