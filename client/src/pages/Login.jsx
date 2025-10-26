import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import AuthCard from '../components/AuthCard';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    
    if (!result.success) {
      showToast(result.error, 'error');
    }
  };

  const handleLinkClick = () => {
    window.location.href = '/register';
  };

  return (
    <AuthCard
      title="Sign in to your account"
      subtitle="Welcome back! Please sign in to continue."
      onSubmit={handleLogin}
      submitText="Sign In"
      isLoading={isLoading}
      linkText="Don't have an account? Sign up"
      onLinkClick={handleLinkClick}
    />
  );
};

export default Login;
