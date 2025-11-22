import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const Register = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem',
        background: '#F5F7FA',
      }}
    >
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl',
          },
        }}
        routing="path"
        path="/register"
        signInUrl="/login"
        afterSignUpUrl="/"
        redirectUrl="/"
      />
    </div>
  );
};

export default Register;
