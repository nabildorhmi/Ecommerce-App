import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router';
import { queryClient } from './app/queryClient';
import { router } from './app/router';
import { RTLProvider } from './shared/components/RTLProvider';

// i18n MUST be imported before ReactDOM.createRoot to avoid FOUC.
// With preloaded resources (no HTTP backend), init resolves synchronously.
import './app/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RTLProvider>
        <RouterProvider router={router} />
      </RTLProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
