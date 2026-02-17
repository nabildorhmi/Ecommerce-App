import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { loginApi, registerApi } from '../api/auth';
import { useAuthStore } from '../store';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);

  // Already authenticated — redirect immediately
  if (user) {
    return <Navigate to="/products" replace />;
  }

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: ({ token, user: loggedInUser }) => {
      useAuthStore.getState().setAuth(token, loggedInUser);
      if (loggedInUser.role === 'admin') {
        void navigate('/admin/products');
      } else {
        void navigate('/products');
      }
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t('auth.loginError');
      setLoginError(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: ({ token, user: newUser }) => {
      useAuthStore.getState().setAuth(token, newUser);
      void navigate('/products');
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t('auth.registerError');
      setRegisterError(message);
    },
  });

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoginError(null);
    await loginMutation.mutateAsync(data);
  };

  const handleRegister = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) => {
    setRegisterError(null);
    await registerMutation.mutateAsync(data);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
          {tab === 0 ? t('auth.login') : t('auth.register')}
        </Typography>

        <Tabs
          value={tab}
          onChange={(_e, v: number) => {
            setTab(v);
            setLoginError(null);
            setRegisterError(null);
          }}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label={t('auth.login')} />
          <Tab label={t('auth.register')} />
        </Tabs>

        <Box>
          {tab === 0 ? (
            <LoginForm onSubmit={handleLogin} error={loginError} />
          ) : (
            <RegisterForm onSubmit={handleRegister} error={registerError} />
          )}
        </Box>
      </Paper>
    </Container>
  );
}
