import { useState } from 'react';

import { signInWithGoogle } from '@/lib/firebase';

export type FormErrors = { email?: string; password?: string; general?: string };

export type AuthFormState = {
  email: string;
  password: string;
  errors: FormErrors;
  isSubmitting: boolean;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setErrors: (e: FormErrors) => void;
  startSubmit: () => void;
  finishSubmit: () => void;
  signInWithGoogle: () => Promise<void>;
};

/**
 * Tiny auth form helper for the 4 auth screens. Owns email + password +
 * errors + isSubmitting. Validation is the caller's responsibility.
 */
export function useAuthForm(): AuthFormState {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrorsState] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (key: keyof FormErrors) =>
    setErrorsState((prev) => ({ ...prev, [key]: undefined }));

  return {
    email,
    password,
    errors,
    isSubmitting,
    setEmail: (v) => {
      setEmail(v);
      clearError('email');
      clearError('general');
    },
    setPassword: (v) => {
      setPassword(v);
      clearError('password');
      clearError('general');
    },
    setErrors: (e) => setErrorsState(e),
    startSubmit: () => {
      setIsSubmitting(true);
      setErrorsState({});
    },
    finishSubmit: () => setIsSubmitting(false),
    signInWithGoogle: async () => {
      setIsSubmitting(true);
      try {
        await signInWithGoogle();
      } catch (e) {
        setErrorsState({ general: e instanceof Error ? e.message : 'Google sign-in failed' });
      } finally {
        setIsSubmitting(false);
      }
    },
  };
}
