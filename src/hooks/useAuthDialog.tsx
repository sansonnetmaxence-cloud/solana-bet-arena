import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface AuthDialogContextValue {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export const AuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);
  return (
    <AuthDialogContext.Provider value={{ open, openDialog, closeDialog }}>
      {children}
    </AuthDialogContext.Provider>
  );
};

export const useAuthDialog = () => {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) throw new Error('useAuthDialog must be used within AuthDialogProvider');
  return ctx;
};
