import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CircleCheckIcon, CircleXIcon, InfoIcon } from 'lucide-react';
import { SnackbarProvider } from 'notistack';
import type { JSX } from 'react';
import { UserProvider } from './contexts/UserContext';
import { Routes } from './Routes';
import { corePalette } from './themes/colours';
import { ErrorBoundary } from './pages/Error/ErrorBoundary/ErrorBoundary';

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <SnackbarProvider
        maxSnack={1}
        autoHideDuration={3000}
        style={{
          minHeight: '56px',
          height: '100%',
          maxWidth: '500px',
          borderRadius: '8px',
          color: corePalette.white,
          backgroundColor: corePalette.offBlack100,
        }}
        iconVariant={{
          success: <CircleCheckIcon style={{ marginRight: '16px' }} fill={corePalette.green150} stroke={corePalette.white} />,
          warning: <InfoIcon style={{ marginRight: '16px' }} fill={corePalette.orange100} stroke={corePalette.white} />,
          error: <CircleXIcon style={{ marginRight: '16px' }} fill={corePalette.red200} stroke={corePalette.white} />,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <UserProvider>
            <Routes />
          </UserProvider>
        </LocalizationProvider>
      </SnackbarProvider>
    </ErrorBoundary>
  );
}

export default App;
