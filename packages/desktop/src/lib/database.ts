// @ts-nocheck
import initSqlJs, { type Database } from 'sql.js';

const DB_NAME = 'simple-email-db';
const DB_STORE = 'sqlitedb';
const DB_KEY = 'main';

let db: Database | null = null;
let saving = false;

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadFromIDB(): Promise<Uint8Array | null> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(DB_STORE, 'readonly');
    const store = tx.objectStore(DB_STORE);
    const req = store.get(DB_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => idb.close();
  });
}

async function saveToIDB(data: Uint8Array): Promise<void> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    store.put(data, DB_KEY);
    tx.oncomplete = () => { idb.close(); resolve(); };
    tx.onerror = () => { idb.close(); reject(tx.error); };
  });
}

export async function persistDB(): Promise<void> {
  if (!db || saving) return;
  saving = true;
  try {
    const data = db.export();
    await saveToIDB(data);
  } finally {
    saving = false;
  }
}

export async function getDB(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => `/${file}`,
  });

  const saved = await loadFromIDB();
  db = saved ? new SQL.Database(saved) : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      imap_host TEXT NOT NULL,
      imap_port INTEGER NOT NULL DEFAULT 993,
      imap_security TEXT NOT NULL DEFAULT 'ssl',
      imap_auth TEXT NOT NULL DEFAULT 'password',
      imap_username TEXT NOT NULL,
      smtp_host TEXT NOT NULL,
      smtp_port INTEGER NOT NULL DEFAULT 465,
      smtp_security TEXT NOT NULL DEFAULT 'ssl',
      smtp_auth TEXT NOT NULL DEFAULT 'password',
      smtp_username TEXT NOT NULL,
      password TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await persistDB();
  return db;
}
