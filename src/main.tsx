import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { storageService } from './services/storageService';

createRoot(document.getElementById('root')!).render(<App />);
void storageService.initializeSupabase();
