import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem',
      background: '#F5F7FA'
    }}>
      <SignIn 
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl'
          }
        }}
        routing="path"
        path="/login"
        signUpUrl="/register"
        afterSignInUrl="/"
        redirectUrl="/"
      />
    </div>
  );
};

export default Login;
