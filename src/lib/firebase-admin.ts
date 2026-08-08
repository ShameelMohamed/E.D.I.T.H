/**
 * Firebase Admin SDK Singleton
 *
 * Initialises firebase-admin once per process, preventing duplicate app
 * initialisation errors during Next.js hot-reload in development.
 *
 * Environment variables required:
 *   FIREBASE_SERVICE_ACCOUNT_JSON  — base64-encoded service account JSON
 *   FIREBASE_PROJECT_ID            — Firebase project ID
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

function getServiceAccount(): object {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.warn("Failed to read serviceAccountKey.json, trying env variable", error);
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "Missing serviceAccountKey.json and env variable: FIREBASE_SERVICE_ACCOUNT_JSON."
    );
  }
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    throw new Error(
      "Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. " +
        "Ensure it is a valid base64-encoded JSON string."
    );
  }
}

function initFirebaseAdmin() {
  // Guard against re-initialisation during hot-reload
  if (getApps().length > 0) {
    return;
  }

  const serviceAccount = getServiceAccount();
  const projectId = process.env.FIREBASE_PROJECT_ID;

  initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
    projectId,
  });
}

// Initialise on module load
initFirebaseAdmin();

/** Firestore database instance — use this in API routes */
export const db: Firestore = getFirestore();
