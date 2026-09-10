import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';

export interface ServiceAccountCredentials {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
}

export function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      return JSON.parse(serviceAccountJson);
    } catch (e: any) {
      console.warn("GOOGLE_SERVICE_ACCOUNT_JSON parse error in lib/googleCloud:", e.message);
    }
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.replace(/^"|"$/g, '');
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
    return {
      client_email: clientEmail,
      private_key: privateKey,
      project_id: process.env.GOOGLE_PROJECT_ID || process.env.GCP_PROJECT_ID,
    };
  }

  return null;
}

let firestoreInstance: Firestore | null = null;
let storageInstance: Storage | null = null;

export function getFirestore(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  const credentials = getServiceAccountCredentials();
  if (!credentials) return null;
  try {
    firestoreInstance = new Firestore({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });
    return firestoreInstance;
  } catch (err: any) {
    console.warn("Could not initialize Firestore:", err.message);
    return null;
  }
}

export function getStorage(): Storage | null {
  if (storageInstance) return storageInstance;
  const credentials = getServiceAccountCredentials();
  if (!credentials) return null;
  try {
    storageInstance = new Storage({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    });
    return storageInstance;
  } catch (err: any) {
    console.warn("Could not initialize Cloud Storage:", err.message);
    return null;
  }
}

export function getGCSBucketName(): string | null {
  return process.env.GCS_BUCKET_NAME || null;
}
