import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isManager: false,
  isStaff: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser && db) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        unsubscribeProfile = onSnapshot(userDocRef, (userDoc) => {
          if (!userDoc.exists()) {
            const isMaster = firebaseUser.email === 'mzaid4379@gmail.com';
            const newProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Unnamed Node',
              photoURL: firebaseUser.photoURL || undefined,
              role: isMaster ? UserRole.ADMIN : UserRole.STAFF, 
              createdAt: serverTimestamp(),
            };
            setDoc(userDocRef, newProfile).catch(console.error);
            setProfile(newProfile);
            setLoading(false);
          } else {
            setProfile(userDoc.data() as UserProfile);
            setLoading(false);
          }
        }, (err) => {
          console.error("Profile sync failed:", err);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === UserRole.ADMIN || user?.email === 'mzaid4379@gmail.com',
    isManager: profile?.role === UserRole.ADMIN || profile?.role === UserRole.MANAGER || user?.email === 'mzaid4379@gmail.com',
    isStaff: profile?.role !== UserRole.VIEWER && !!profile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
