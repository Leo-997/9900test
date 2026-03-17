import { CssBaseline, ThemeProvider } from '@mui/material';
import dayjs from 'dayjs';
import dayjsBusinessDays from 'dayjs-business-days2';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import { createRoot } from 'react-dom/client';
import 'simplebar/dist/simplebar.min.css';
import App from './App';
import { ZeroDashSdkProvider } from './contexts/ZeroDashSdkContext';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { zccTheme } from './themes/zccTheme';

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(dayjsBusinessDays);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <CssBaseline />
      <ThemeProvider theme={zccTheme}>
        <ZeroDashSdkProvider>
          <App />
        </ZeroDashSdkProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
