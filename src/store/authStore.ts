import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  User,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { auth, googleProvider, storage, firestore } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import toast from 'react-hot-toast';
import { securityLogger } from '../utils/securityLogger';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended' | 'banned';
  isGuest: boolean;
  guestNumber?: number;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  lastLoginDate: string | null;
  users: AuthUser[];
}

interface AuthActions {
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: (remember?: boolean) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (userId: string, updates: Partial<AuthUser>) => Promise<void>;
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string>;
  deleteProfilePicture: () => Promise<void>;
  setRememberMe: (value: boolean) => void;
  fetchUsers: () => Promise<void>;
  getUserById: (userId: string) => AuthUser | undefined;
  deleteUser: (userId: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      lastLoginDate: null,
      users: [],

      signIn: async (email, password, remember = false) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          securityLogger.logAuthAttempt(true, userCredential.user.uid, '127.0.0.1');
          
          set({ 
            user: userCredential.user, 
            isGuest: false,
            rememberMe: remember,
            lastLoginDate: remember ? new Date().toISOString() : null
          });
          
          toast.success('Successfully signed in!');
        } catch (error: any) {
          const errorMessage = error.code === 'auth/invalid-credential' 
            ? 'Invalid email or password'
            : error.message;
          
          securityLogger.logAuthAttempt(false, email, '127.0.0.1');
          
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName });
          
          // Create user document in Firestore
          const userDoc = doc(firestore, 'users', userCredential.user.uid);
          await updateDoc(userDoc, {
            email,
            displayName,
            role: 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          });

          securityLogger.logSystemEvent(
            `New user registration: ${email}`,
            'low',
            { userId: userCredential.user.uid }
          );

          set({ 
            user: userCredential.user, 
            isGuest: false,
            lastLoginDate: new Date().toISOString()
          });
          
          toast.success('Account created successfully!');
        } catch (error: any) {
          const errorMessage = error.code === 'auth/email-already-in-use'
            ? 'Email already in use'
            : error.message;
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithGoogle: async (remember = false) => {
        set({ isLoading: true, error: null });
        try {
          const result = await signInWithPopup(auth, googleProvider);
          
          securityLogger.logAuthAttempt(true, result.user.uid, '127.0.0.1');
          
          set({ 
            user: result.user, 
            isGuest: false,
            rememberMe: remember,
            lastLoginDate: remember ? new Date().toISOString() : null
          });
          
          toast.success('Successfully signed in with Google!');
        } catch (error: any) {
          securityLogger.logAuthAttempt(false, 'google-auth', '127.0.0.1');
          set({ error: error.message });
          toast.error('Failed to sign in with Google');
        } finally {
          set({ isLoading: false });
        }
      },

      continueAsGuest: () => {
        const guestNumber = get().users.filter(u => u.isGuest).length + 1;
        const guestUser: AuthUser = {
          uid: `guest-${guestNumber}`,
          email: null,
          displayName: `Guest #${guestNumber}`,
          photoURL: null,
          role: 'user',
          status: 'active',
          isGuest: true,
          guestNumber,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        // Save guest user
        const guestUsers = JSON.parse(localStorage.getItem('guest-users') || '[]');
        localStorage.setItem('guest-users', JSON.stringify([...guestUsers, guestUser]));

        set(state => ({
          user: null,
          isGuest: true,
          users: [...state.users, guestUser]
        }));

        securityLogger.logSystemEvent(
          `Guest user created: Guest #${guestNumber}`,
          'low',
          { guestNumber }
        );

        toast.success('Continuing as guest');
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          const { user, isGuest } = get();
          if (user) {
            securityLogger.logAuthAttempt(true, user.uid, '127.0.0.1');
            await signOut(auth);
          }
          
          set({ 
            user: null, 
            isGuest: false, 
            rememberMe: false,
            lastLoginDate: null 
          });
          
          toast.success('Successfully logged out');
        } catch (error: any) {
          set({ error: error.message });
          toast.error('Failed to log out');
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await sendPasswordResetEmail(auth, email);
          
          securityLogger.logSystemEvent(
            `Password reset requested for: ${email}`,
            'medium',
            { email }
          );
          
          toast.success('Password reset email sent!');
        } catch (error: any) {
          const errorMessage = error.code === 'auth/user-not-found'
            ? 'No account found with this email'
            : error.message;
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      updateUserProfile: async (userId, updates) => {
        try {
          const userRef = doc(firestore, 'users', userId);
          await updateDoc(userRef, updates);
          
          set(state => ({
            users: state.users.map(user =>
              user.uid === userId ? { ...user, ...updates } : user
            )
          }));

          securityLogger.logDataEvent(
            'update',
            userId,
            'user_profile',
            true
          );

          toast.success('User profile updated successfully');
        } catch (error: any) {
          console.error('Failed to update user profile:', error);
          
          securityLogger.logDataEvent(
            'update',
            userId,
            'user_profile',
            false
          );
          
          throw error;
        }
      },

      updateUserEmail: async (newEmail, password) => {
        const user = auth.currentUser;
        if (!user?.email) throw new Error('No user email');

        try {
          const credential = EmailAuthProvider.credential(user.email, password);
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, newEmail);
          
          securityLogger.logDataEvent(
            'update',
            user.uid,
            'user_email',
            true
          );
          
          set({ user: auth.currentUser });
          toast.success('Email updated successfully!');
        } catch (error: any) {
          securityLogger.logDataEvent(
            'update',
            user.uid,
            'user_email',
            false
          );
          
          console.error('Email update error:', error);
          toast.error('Failed to update email');
          throw error;
        }
      },

      updateUserPassword: async (currentPassword, newPassword) => {
        const user = auth.currentUser;
        if (!user?.email) throw new Error('No user email');

        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
          
          securityLogger.logDataEvent(
            'update',
            user.uid,
            'user_password',
            true
          );
          
          toast.success('Password updated successfully!');
        } catch (error: any) {
          securityLogger.logDataEvent(
            'update',
            user.uid,
            'user_password',
            false
          );
          
          console.error('Password update error:', error);
          toast.error('Failed to update password');
          throw error;
        }
      },

      deleteAccount: async (password) => {
        const user = auth.currentUser;
        if (!user?.email) throw new Error('No user email');

        try {
          const credential = EmailAuthProvider.credential(user.email, password);
          await reauthenticateWithCredential(user, credential);

          // Delete profile picture if exists
          if (user.photoURL) {
            const photoRef = ref(storage, `profile-pictures/${user.uid}`);
            await deleteObject(photoRef);
          }

          // Delete user data
          await deleteDoc(doc(firestore, 'users', user.uid));

          securityLogger.logSystemEvent(
            `Account deleted: ${user.email}`,
            'high',
            { userId: user.uid }
          );

          // Delete account
          await deleteUser(user);
          
          set({ 
            user: null, 
            isGuest: false, 
            rememberMe: false,
            lastLoginDate: null 
          });
          
          toast.success('Account deleted successfully');
        } catch (error: any) {
          console.error('Account deletion error:', error);
          toast.error('Failed to delete account');
          throw error;
        }
      },

      uploadProfilePicture: async (file) => {
        const user = auth.currentUser;
        if (!user) throw new Error('No user found');

        try {
          // Create optimistic update
          const tempUrl = URL.createObjectURL(file);
          const optimisticUser = { ...user, photoURL: tempUrl };
          set({ user: optimisticUser as User });

          // Upload to Firebase Storage
          const storageRef = ref(storage, `profile-pictures/${user.uid}`);
          const uploadResult = await uploadBytes(storageRef, file);
          const photoURL = await getDownloadURL(uploadResult.ref);

          // Update profile
          await updateProfile(user, { photoURL });
          
          securityLogger.logDataEvent(
            'upload',
            user.uid,
            'profile_picture',
            true
          );
          
          // Update state with actual URL
          set({ user: auth.currentUser });
          
          // Cleanup
          URL.revokeObjectURL(tempUrl);

          return photoURL;
        } catch (error) {
          securityLogger.logDataEvent(
            'upload',
            user.uid,
            'profile_picture',
            false
          );
          
          // Revert optimistic update
          set({ user: auth.currentUser });
          throw error;
        }
      },

      deleteProfilePicture: async () => {
        const user = auth.currentUser;
        if (!user) throw new Error('No user found');

        try {
          // Optimistic update
          const previousPhotoURL = user.photoURL;
          const optimisticUser = { ...user, photoURL: '' };
          set({ user: optimisticUser as User });

          if (previousPhotoURL) {
            const storageRef = ref(storage, `profile-pictures/${user.uid}`);
            await deleteObject(storageRef);
          }

          await updateProfile(user, { photoURL: '' });
          
          securityLogger.logDataEvent(
            'delete',
            user.uid,
            'profile_picture',
            true
          );
          
          set({ user: auth.currentUser });
        } catch (error) {
          securityLogger.logDataEvent(
            'delete',
            user.uid,
            'profile_picture',
            false
          );
          
          // Revert optimistic update
          set({ user: auth.currentUser });
          throw error;
        }
      },

      setRememberMe: (value) => set({ rememberMe: value }),

      fetchUsers: async () => {
        try {
          // Fetch registered users from Firestore
          const usersQuery = query(
            collection(firestore, 'users'),
            orderBy('createdAt', 'desc'),
            limit(100)
          );
          
          const usersSnapshot = await getDocs(usersQuery);
          const registeredUsers = usersSnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
          })) as AuthUser[];

          // Get guest users from local storage
          const guestUsers = JSON.parse(localStorage.getItem('guest-users') || '[]');
          
          set({ users: [...registeredUsers, ...guestUsers] });
          
          securityLogger.logDataEvent(
            'read',
            'system',
            'users',
            true
          );
        } catch (error) {
          securityLogger.logDataEvent(
            'read',
            'system',
            'users',
            false
          );
          
          console.error('Failed to fetch users:', error);
          throw error;
        }
      },

      getUserById: (userId) => {
        return get().users.find(u => u.uid === userId);
      },

      deleteUser: async (userId) => {
        try {
          // Delete from Firestore
          await deleteDoc(doc(firestore, 'users', userId));
          
          // Delete from local state
          set(state => ({
            users: state.users.filter(u => u.uid !== userId)
          }));

          securityLogger.logDataEvent(
            'delete',
            userId,
            'user',
            true
          );
          
          toast.success('User deleted successfully');
        } catch (error) {
          securityLogger.logDataEvent(
            'delete',
            userId,
            'user',
            false
          );
          
          console.error('Failed to delete user:', error);
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        rememberMe: state.rememberMe,
        lastLoginDate: state.lastLoginDate,
        isGuest: state.isGuest,
      }),
    }
  )
);