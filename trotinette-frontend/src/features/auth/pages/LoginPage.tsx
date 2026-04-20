import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router';
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
import { useCartStore } from '@/features/cart/store';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { PageDecor } from '@/shared/components/PageDecor';

const bgVariants: Variants = {
  animate: {
    backgroundPosition: ['0% 0%', '100% 100%', '0% 100%', '100% 0%'],
    transition: { duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }
  }
};

export function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const isAuthenticating = useRef(false);

  const user = useAuthStore((s) => s.user);

  // Already authenticated — redirect (skip during active login/register to avoid unmount before sync)
  if (user && !isAuthenticating.current) {
    return <Navigate to="/products" replace />;
  }

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
  });

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoginError(null);
    isAuthenticating.current = true;
    try {
      const { token, user: loggedInUser } = await loginMutation.mutateAsync(data);
      useAuthStore.getState().setAuth(token, loggedInUser);
      await useCartStore.getState().syncWithServer();
      if (loggedInUser.role === 'admin' || loggedInUser.role === 'global_admin') {
        void navigate('/admin');
      } else {
        void navigate('/products');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Identifiants incorrects";
      setLoginError(message);
    } finally {
      isAuthenticating.current = false;
    }
  };

  const handleRegister = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) => {
    setRegisterError(null);
    isAuthenticating.current = true;
    try {
      const { token, user: newUser } = await registerMutation.mutateAsync(data);
      useAuthStore.getState().setAuth(token, newUser);
      await useCartStore.getState().syncWithServer();
      void navigate('/products');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Erreur lors de l'inscription";
      setRegisterError(message);
    } finally {
      isAuthenticating.current = false;
    }
  };

  return (
    <Box
      component={motion.div}
      variants={bgVariants}
      animate="animate"
      sx={{
        py: 8,
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(0,194,255,0.05) 0%, rgba(12,12,20,1) 70%)',
        backgroundSize: '200% 200%',
        overflow: 'hidden'
      }}
    >
      {/* Decorative floating blurs */}
      <Box sx={{ position: 'absolute', top: '10%', left: '20%', width: 300, height: 300, background: 'rgba(0,194,255,0.05)', filter: 'blur(80px)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', bottom: '10%', right: '20%', width: 400, height: 400, background: 'rgba(199,64,77,0.03)', filter: 'blur(100px)', borderRadius: '50%' }} />

      <PageDecor variant="auth" />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <Paper
            elevation={0}
            className="mirai-glass"
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: '24px',
            }}
          >
            <Typography variant="h4" fontWeight="800" textAlign="center" mb={1} color="var(--mirai-white)" letterSpacing="-0.02em">
              {tab === 0 ? "Bon retour" : "Créer un compte"}
            </Typography>
            <Typography variant="body2" textAlign="center" mb={4} color="var(--mirai-gray)">
              {tab === 0 ? "Connectez-vous pour accéder à votre espace" : "Rejoignez la nouvelle ère de la mobilité"}
            </Typography>

            <Tabs
              value={tab}
              onChange={(_e, v: number) => {
                setTab(v);
                setLoginError(null);
                setRegisterError(null);
              }}
              centered
              sx={{
                mb: 4,
                '& .MuiTabs-indicator': { backgroundColor: 'var(--mirai-cyan)', height: 2, borderRadius: 2 },
                '& .MuiTab-root': {
                  fontWeight: 600, color: 'var(--mirai-gray)', textTransform: 'none', fontSize: '1rem',
                  transition: 'color 0.3s',
                  '&.Mui-selected': { color: 'var(--mirai-white)', textShadow: '0 0 8px rgba(0,194,255,0.15)' }
                }
              }}
            >
              <Tab label={"Connexion"} disableRipple />
              <Tab label={"Inscription"} disableRipple />
            </Tabs>

            <Box sx={{ position: 'relative', minHeight: 400 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tab === 0 ? 20 : -20 }}
                  transition={{ duration: 0.3, ease: 'linear' }}
                >
                  {tab === 0 ? (
                    <LoginForm onSubmit={handleLogin} error={loginError} />
                  ) : (
                    <RegisterForm onSubmit={handleRegister} error={registerError} />
                  )}
                </motion.div>
              </AnimatePresence>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
