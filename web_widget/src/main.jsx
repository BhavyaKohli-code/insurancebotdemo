import { createRoot } from 'react-dom/client';
import 'tailwindcss/index.css';
import ChatWidget from './ChatWidget.jsx';

createRoot(document.getElementById('root')).render(<ChatWidget />);
