import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import AuthCard from '../components/AuthCard';

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (email, password) => {
    setIsLoading(true);
    const result = await register(email, password);
    setIsLoading(false);
    
    if (result.success) {
      showToast('Registration successful! Please sign in.', 'success');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleLinkClick = () => {
    window.location.href = '/login';
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Get started with your free account today."
      onSubmit={handleRegister}
      submitText="Sign Up"
      isLoading={isLoading}
      linkText="Already have an account? Sign in"
      onLinkClick={handleLinkClick}
    />
  );
};

export default Register;
