import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Layout } from 'lucide-react';

export const Login: React.FC = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 transform -rotate-6 shadow-xl">
            <Layout className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Stock Master</h1>
          <p className="text-slate-400 mt-2">Enterprise Inventory & Business Control</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 h-14 rounded-xl font-bold transition-all active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            Securely access your business data. <br />
            Role-based access will be assigned by your administrator.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
