import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, Role } from '../types';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
    logout: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // User is logged in, fetch their role from Firestore
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setCurrentUser(userDoc.data() as User);
                } else {
                    // If the user doesn't exist in Firestore, create them with 'alumno' as default role
                    const newUser: User = {
                        uid: firebaseUser.uid,
                        name: firebaseUser.displayName || firebaseUser.email || 'Usuario',
                        email: firebaseUser.email || '',
                        role: 'alumno', // Default role; admin must upgrade manually in Firestore
                        createdAt: Date.now(),
                    };
                    await setDoc(userDocRef, newUser);
                    setCurrentUser(newUser);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
