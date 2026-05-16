'use client';

import { Provider } from 'react-redux';
import { AuthProvider } from '../context/AuthContext';
import { store } from '../redux/store';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}
