import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

let configData: any = { apiKey: 'PLACEHOLDER' };
try {
  configData = config;
} catch (e) {
  console.error("Failed to load Firebase config:", e);
}

// Check if the config is actually a placeholder or real
const isPlaceholder = !configData || configData.apiKey === 'PLACEHOLDER';

export const app = !isPlaceholder ? initializeApp(configData) : null;
export const auth = app ? getAuth(app) : null;

// Initialize Firestore with settings to help in restricted environments
let dbInstance = null;
try {
  if (app) {
    dbInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  }
} catch (e) {
  console.error("Firestore initialization failed:", e);
}
export const db = dbInstance;

export const googleProvider = new GoogleAuthProvider();

export const isFirebaseConfigured = !isPlaceholder;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by instructions
async function testConnection() {
  if (!db) return;
  try {
    // Attempting to fetch a non-existent doc from server to verify connection
    await getDocFromServer(doc(db, 'system', 'heartbeat'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase is reporting offline status. Please verify your network connection and Firebase configuration (ApiKey, ProjectId).");
    } else {
      console.warn("Firebase heartbeat check returned an error (expected if doc missing, but connection worked):", error);
    }
  }
}

if (isFirebaseConfigured) {
  testConnection();
}
