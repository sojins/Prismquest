import React from 'react';
import { createRoot } from 'react-dom/client';
import BookApp from './BookApp';
import './styles.css';
import './book.css';

createRoot(document.getElementById('root')).render(<BookApp />);
