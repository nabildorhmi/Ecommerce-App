import { useState } from 'react';
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
          ?.message ?? "Identifiants incorrects";
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
          ?.message ?? "Erreur lors de l'inscription";
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
        background: 'radial-gradient(circle at 50% 50%, rgba(0,194,255,0.05) 0%, rgba(11,11,14,1) 70%)',
        backgroundSize: '200% 200%',
        overflow: 'hidden'
      }}
    >
      {/* Decorative floating blurs */}
      <Box sx={{ position: 'absolute', top: '10%', left: '20%', width: 300, height: 300, background: 'rgba(0,194,255,0.05)', filter: 'blur(80px)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', bottom: '10%', right: '20%', width: 400, height: 400, background: 'rgba(230,57,70,0.03)', filter: 'blur(100px)', borderRadius: '50%' }} />

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
                  '&.Mui-selected': { color: 'var(--mirai-white)', textShadow: '0 0 10px rgba(0,194,255,0.3)' }
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
