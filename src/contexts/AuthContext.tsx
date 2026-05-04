import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserRole {
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  name: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userRole: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userRole: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (authenticatedUser) => {
      setUser(authenticatedUser);
      if (authenticatedUser) {
        const userDoc = await getDoc(doc(db, 'users', authenticatedUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data() as UserRole);
        } else {
          // New user default role
          const defaultRole: UserRole = { role: 'STAFF', name: authenticatedUser.displayName || 'Generic User' };
          await setDoc(doc(db, 'users', authenticatedUser.uid), {
            id: authenticatedUser.uid,
            email: authenticatedUser.email,
            ...defaultRole,
            createdAt: new Date().toISOString()
          });
          setUserRole(defaultRole);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
