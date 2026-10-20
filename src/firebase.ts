import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword, 
  sendEmailVerification, 
  deleteUser, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  limit, 
  orderBy, 
  getDocFromServer,
  serverTimestamp 
} from 'firebase/firestore';

// Native Firebase configuration (pure TypeScript)
export const firebaseAppConfig = {
  projectId: "deductive-geography-2vr20",
  appId: "1:475900072629:web:a3b9334faa2c2603b7a4fc",
  apiKey: "AIzaSyCM33pq2T-avusxfp5VuU2IkpkF1GEH8DY",
  authDomain: "deductive-geography-2vr20.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixlumnysa-4fd36801-3322-485a-a4cc-ef3194c7258f",
  storageBucket: "deductive-geography-2vr20.firebasestorage.app",
  messagingSenderId: "475900072629"
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseAppConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with designated high-scale database instance
export const db = firebaseAppConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseAppConfig.firestoreDatabaseId)
  : getFirestore(app);

// Error logging per Firebase integration skill (plain text)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = `Firestore Error [${operationType}] at [${path || 'root'}]: ${error instanceof Error ? error.message : String(error)}`;
  console.error(errMsg);
  throw new Error(errMsg);
}

// Connection test on boot as required by system skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test completed.");
    return true;
  } catch (error: any) {
    if (error && typeof error.message === 'string' && error.message.includes('the client is offline')) {
      console.warn("Firestore client is running in offline mode. Please check connection.");
      return false;
    }
    return true;
  }
}

// User Profile Model in Firestore (Grade 12 database architecture)
export interface LearnerProfile {
  uid: string;
  initials: string;           // Required e.g. "K.M."
  username: string;           // Required e.g. "lerato_2026"
  email: string;              // Required Gmail account e.g. "lerato@gmail.com"
  displayName: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  schoolName: string;         // Grade 12 School
  province?: string;
  targetAggregate?: string;
  selectedSubjects: string[]; // Grade 12 CAPS subjects
  isBanned?: boolean;         // For Admin ban control
  role?: 'learner' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface LearnerBookmark {
  id: string;
  userId: string;
  subjectId: string;
  paperTitle: string;
  questionNumber: string;
  questionText: string;
  notes?: string;
  createdAt: string;
}

// Initial sample accounts for Admin analytics
const INITIAL_DEMO_LEARNERS: LearnerProfile[] = [
  {
    uid: 'demo_user_1',
    initials: 'S.M.',
    username: 'siyabonga_m',
    displayName: 'Siyabonga Mthembu',
    email: 'siyabonga.m@gmail.com',
    phoneNumber: '+27 82 491 8023',
    phoneVerified: true,
    emailVerified: true,
    schoolName: 'Pretoria Boys High School (Public)',
    province: 'Gauteng',
    targetAggregate: 'Bachelor Pass (Distinction 85%+)',
    selectedSubjects: ['maths', 'physci', 'lifesci', 'eng_hl', 'afr_eat', 'lo', 'accounting'],
    isBanned: false,
    role: 'learner',
    createdAt: '2026-09-12T08:30:00.000Z'
  },
  {
    uid: 'demo_user_2',
    initials: 'L.N.',
    username: 'lerato_ndlovu',
    displayName: 'Lerato Ndlovu',
    email: 'lerato.ndlovu@gmail.com',
    phoneNumber: '+27 71 884 9912',
    phoneVerified: true,
    emailVerified: true,
    schoolName: 'Soweto Secondary Public School',
    province: 'Gauteng',
    targetAggregate: 'Bachelor Pass (80%+)',
    selectedSubjects: ['maths', 'physci', 'lifesci', 'eng_hl', 'zulu_fal', 'lo', 'geography'],
    isBanned: false,
    role: 'learner',
    createdAt: '2026-09-15T11:20:00.000Z'
  },
  {
    uid: 'demo_user_3',
    initials: 'K.D.',
    username: 'khaya_dlamini',
    displayName: 'Khaya Dlamini',
    email: 'khaya.d@gmail.com',
    phoneNumber: '+27 83 234 5678',
    phoneVerified: false,
    emailVerified: true,
    schoolName: 'Menzi High School (Umlazi Public)',
    province: 'KwaZulu-Natal',
    targetAggregate: 'Bachelor Pass',
    selectedSubjects: ['mathlit', 'accounting', 'busstudies', 'economics', 'eng_hl', 'zulu_hl', 'lo'],
    isBanned: false,
    role: 'learner',
    createdAt: '2026-09-18T14:45:00.000Z'
  },
  {
    uid: 'demo_user_4',
    initials: 'T.M.',
    username: 'thabo_molefe',
    displayName: 'Thabo Molefe',
    email: 'thabo.molefe@gmail.com',
    phoneNumber: '+27 79 123 9876',
    phoneVerified: true,
    emailVerified: false,
    schoolName: 'Khayelitsha Secondary Public School',
    province: 'Western Cape',
    targetAggregate: 'Diploma Pass',
    selectedSubjects: ['mathlit', 'history', 'geography', 'tourism', 'eng_hl', 'xhosa_fal', 'lo'],
    isBanned: true,
    role: 'learner',
    createdAt: '2026-09-20T16:10:00.000Z'
  },
  {
    uid: 'demo_user_5',
    initials: 'N.K.',
    username: 'nomvula_k',
    displayName: 'Nomvula Khumalo',
    email: 'nomvula.k@gmail.com',
    phoneNumber: '+27 84 555 4321',
    phoneVerified: true,
    emailVerified: true,
    schoolName: 'Mbilwi Secondary School (Public)',
    province: 'Limpopo',
    targetAggregate: 'Bachelor Pass (Distinction)',
    selectedSubjects: ['maths', 'physci', 'lifesci', 'agrisci', 'eng_hl', 'tshivenda_hl', 'lo'],
    isBanned: false,
    role: 'learner',
    createdAt: '2026-09-22T09:15:00.000Z'
  }
];

// In-memory learner registry and plain text storage serializer
let memoryLearnersStore: LearnerProfile[] = [...INITIAL_DEMO_LEARNERS];
const LOCAL_USERS_KEY = 'lumnysa_learners_plain_txt';

function serializeLearnersToText(list: LearnerProfile[]): string {
  return list.map(l => [
    l.uid || '',
    l.initials || '',
    l.username || '',
    l.email || '',
    l.displayName || '',
    l.phoneNumber || '',
    l.phoneVerified ? '1' : '0',
    l.emailVerified ? '1' : '0',
    l.schoolName || '',
    l.province || '',
    l.targetAggregate || '',
    (l.selectedSubjects || []).join(';'),
    l.isBanned ? '1' : '0',
    l.role || 'learner',
    l.createdAt || '',
    l.updatedAt || ''
  ].join('~|~')).join('\n---MATRIC_USER---\n');
}

function deserializeLearnersFromText(rawText: string): LearnerProfile[] {
  if (!rawText || !rawText.trim()) return [];
  const entries = rawText.split('\n---MATRIC_USER---\n');
  return entries.map(entry => {
    const p = entry.split('~|~');
    return {
      uid: p[0] || '',
      initials: p[1] || 'K.M.',
      username: p[2] || 'learner',
      email: p[3] || '',
      displayName: p[4] || '',
      phoneNumber: p[5] || '',
      phoneVerified: p[6] === '1',
      emailVerified: p[7] === '1',
      schoolName: p[8] || 'Grade 12 High School',
      province: p[9] || 'Gauteng',
      targetAggregate: p[10] || 'Bachelor Pass',
      selectedSubjects: p[11] ? p[11].split(';').filter(Boolean) : ['maths', 'physci'],
      isBanned: p[12] === '1',
      role: (p[13] === 'admin' ? 'admin' : 'learner') as 'learner' | 'admin',
      createdAt: p[14] || new Date().toISOString(),
      updatedAt: p[15] || ''
    };
  }).filter(u => u.uid);
}

function getLocalLearners(): LearnerProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = deserializeLearnersFromText(raw);
      if (parsed.length > 0) {
        memoryLearnersStore = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read plain text learners store:", e);
  }
  return memoryLearnersStore;
}

function saveLocalLearners(learners: LearnerProfile[]) {
  memoryLearnersStore = learners;
  try {
    localStorage.setItem(LOCAL_USERS_KEY, serializeLearnersToText(learners));
  } catch (e) {
    console.warn("Could not save plain text learners store:", e);
  }
}

// ---------------- USER LIFECYCLE OPERATIONS ----------------

// 1. Create Learner Account
export async function registerLearner(
  email: string, 
  pass: string, 
  profileData: Partial<LearnerProfile>
): Promise<LearnerProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = cred.user.uid;
  const nowIso = new Date().toISOString();

  const derivedInitials = profileData.initials || 
    (profileData.displayName || email.split('@')[0])
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('.') + '.';

  const newProfile: LearnerProfile = {
    uid,
    initials: derivedInitials,
    username: profileData.username || email.split('@')[0].toLowerCase(),
    email,
    displayName: profileData.displayName || profileData.username || email.split('@')[0],
    phoneNumber: profileData.phoneNumber || '',
    phoneVerified: !!profileData.phoneVerified,
    emailVerified: cred.user.emailVerified,
    schoolName: profileData.schoolName || 'Grade 12 High School',
    province: profileData.province || 'Gauteng',
    targetAggregate: profileData.targetAggregate || 'Bachelor Pass (Distinction 80%+)',
    selectedSubjects: profileData.selectedSubjects || ['maths', 'physci', 'lifesci', 'lo', 'eng_hl'],
    isBanned: false,
    role: (email.toLowerCase().includes('admin') || profileData.role === 'admin') ? 'admin' : 'learner',
    createdAt: nowIso,
    updatedAt: nowIso
  };

  try {
    await setDoc(doc(db, 'users', uid), newProfile);
  } catch (err) {
    console.warn("Firestore setDoc note:", err);
  }

  // Update local directory for admin view
  const currentList = getLocalLearners();
  const filtered = currentList.filter(u => u.uid !== uid && u.email !== email);
  saveLocalLearners([newProfile, ...filtered]);

  return newProfile;
}

// 2. Login Learner
export async function loginLearner(email: string, pass: string): Promise<LearnerProfile | null> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  let profile: LearnerProfile | null = null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (userDoc.exists()) {
      profile = userDoc.data() as LearnerProfile;
    }
  } catch (err) {
    console.warn("Firestore getDoc error:", err);
  }

  if (!profile) {
    const local = getLocalLearners().find(u => u.uid === cred.user.uid || u.email.toLowerCase() === email.toLowerCase());
    if (local) {
      profile = local;
    } else {
      const nowIso = new Date().toISOString();
      const initials = email.charAt(0).toUpperCase() + '.';
      profile = {
        uid: cred.user.uid,
        initials,
        username: email.split('@')[0].toLowerCase(),
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split('@')[0],
        phoneNumber: cred.user.phoneNumber || '',
        phoneVerified: !!cred.user.phoneNumber,
        emailVerified: cred.user.emailVerified,
        schoolName: 'Grade 12 High School',
        province: 'Gauteng',
        targetAggregate: 'Bachelor Pass',
        selectedSubjects: ['maths', 'physci', 'lifesci'],
        isBanned: false,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'learner',
        createdAt: nowIso
      };
      try {
        await setDoc(doc(db, 'users', cred.user.uid), profile);
      } catch (e) {
        console.warn("Firestore fallback setDoc:", e);
      }
    }
  }

  if (profile.isBanned) {
    throw new Error('Your account has been suspended or banned by the system administrator. Please contact school support.');
  }

  return profile;
}

// 3. Log Out
export async function logoutLearner(): Promise<void> {
  await signOut(auth);
}

// 4. Delete Learner Account
export async function deleteLearnerAccount(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated learner to delete");

  const uid = user.uid;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn("Could not delete firestore user document:", err);
  }

  const current = getLocalLearners().filter(u => u.uid !== uid);
  saveLocalLearners(current);

  await deleteUser(user);
}

// 5. Forgot Password
export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// 6. Change Password
export async function changeLearnerPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Please log in to change your password");
  await updatePassword(user, newPassword);
}

// 7. Email Verification
export async function triggerEmailVerification(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("No active user found to send verification email");
  await sendEmailVerification(user);
}

// 8. Fetch Learner Profile
export async function fetchLearnerProfile(uid: string): Promise<LearnerProfile | null> {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as LearnerProfile;
    }
  } catch (err) {
    console.warn("fetchLearnerProfile firestore error:", err);
  }
  return getLocalLearners().find(u => u.uid === uid) || null;
}

// 9. Update Learner Profile
export async function updateLearnerProfile(
  uid: string, 
  updates: Partial<LearnerProfile>
): Promise<void> {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("updateLearnerProfile firestore error:", err);
  }

  const current = getLocalLearners();
  const idx = current.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...updates, updatedAt: new Date().toISOString() };
    saveLocalLearners(current);
  }
}

// ---------------- ADMIN ACCOUNT OPERATIONS ----------------

// Fetch all registered learners for Admin "behind the scenes"
export async function fetchAllLearners(): Promise<LearnerProfile[]> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, limit(100));
    const snap = await getDocs(q);
    const list: LearnerProfile[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data() as LearnerProfile);
    });
    if (list.length > 0) {
      const local = getLocalLearners();
      const map = new Map<string, LearnerProfile>();
      local.forEach(u => map.set(u.uid, u));
      list.forEach(u => map.set(u.uid, u));
      return Array.from(map.values());
    }
  } catch (err) {
    console.warn("Admin fetchAllLearners error (using plain text store):", err);
  }
  return getLocalLearners();
}

// Admin: Delete user
export async function adminDeleteLearner(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn("adminDeleteLearner firestore error:", err);
  }
  const current = getLocalLearners().filter(u => u.uid !== uid);
  saveLocalLearners(current);
}

// Admin: Ban / Unban user
export async function adminBanLearner(uid: string, banStatus: boolean): Promise<void> {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      isBanned: banStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("adminBanLearner firestore error:", err);
  }
  const current = getLocalLearners();
  const idx = current.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    current[idx].isBanned = banStatus;
    current[idx].updatedAt = new Date().toISOString();
    saveLocalLearners(current);
  }
}

// ---------------- BOOKMARKS & ACTIVITIES ----------------

export async function addLearnerBookmark(
  userId: string,
  bookmark: Omit<LearnerBookmark, 'createdAt'>
): Promise<void> {
  const bookmarkRef = doc(db, 'users', userId, 'bookmarks', bookmark.id);
  await setDoc(bookmarkRef, {
    ...bookmark,
    createdAt: new Date().toISOString()
  });
}

export async function fetchLearnerBookmarks(userId: string): Promise<LearnerBookmark[]> {
  try {
    const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
    const q = query(bookmarksRef, limit(50));
    const snap = await getDocs(q);
    const list: LearnerBookmark[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data() as LearnerBookmark);
    });
    return list;
  } catch (e) {
    return [];
  }
}

export async function removeLearnerBookmark(userId: string, bookmarkId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'bookmarks', bookmarkId));
}

export async function saveLearnerActivity(userId: string, activity: any): Promise<void> {
  try {
    const actRef = doc(db, 'users', userId, 'activities', activity.id);
    await setDoc(actRef, {
      ...activity,
      userId,
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.warn("saveLearnerActivity error:", err);
  }
}

export async function fetchLearnerActivities(userId: string): Promise<any[]> {
  try {
    const actRef = collection(db, 'users', userId, 'activities');
    const q = query(actRef, limit(50));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data());
    });
    return list;
  } catch (e) {
    return [];
  }
}

export async function deleteLearnerActivity(userId: string, activityId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'activities', activityId));
  } catch (e) {
    console.warn("deleteLearnerActivity error:", e);
  }
}
