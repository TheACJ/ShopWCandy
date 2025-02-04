import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Loader } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  });
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: SignupForm) => {
    try {
      setIsLoading(true);
      const { error } = await signup(data.email, data.password);
      
      if (error) throw error;
      
      toast.success('Please check your email to confirm your account');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Google signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
          Redefine your looks
        </h2>
        <p className="mt-3 text-center text-sm text-indigo-100/80">
          Already have an account?{' '}
          <a href="/login" className="font-medium bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            Sign in here
          </a>
        </p>
      </div>
  
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="backdrop-blur-xl bg-white/5 py-8 px-6 sm:px-10 rounded-2xl border border-white/10 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-indigo-100/80 mb-2">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-rose-400/80">{errors.email.message}</p>
                )}
              </div>
            </div>
  
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-indigo-100/80 mb-2">
                Password
              </label>
              <div className="mt-1">
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-rose-400/80">{errors.password.message}</p>
                )}
              </div>
            </div>
  
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-100/80 mb-2">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  {...register('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-rose-400/80">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
  
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-600 transition-all duration-300 disabled:bg-gray-500/20 disabled:backdrop-blur-sm disabled:text-gray-400"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </div>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
  
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-transparent text-sm text-indigo-100/60 backdrop-blur-sm">
                  Or continue with
                </span>
              </div>
            </div>
  
            <div className="mt-6">
              <button
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 py-2.5 px-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl text-indigo-100/80 hover:bg-white/10 transition-colors duration-300 disabled:opacity-50"
              >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}