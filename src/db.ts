import { openDB, type IDBPDatabase } from 'idb'
import type { SavedColorScheme } from './types'

const DB_NAME = 'donek-color-db'
const STORE_NAME = 'user-schemes'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

/** 检测 IndexedDB 是否可用 */
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
}

// ========== localStorage 降级 ==========
const LS_KEY = 'donek-user-schemes'

function lsGetAll(): SavedColorScheme[] {
  try {
    const data = localStorage.getItem(LS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function lsSave(schemes: SavedColorScheme[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(schemes))
}

// ========== 对外接口 ==========

/** 保存配色方案 */
export async function saveScheme(scheme: SavedColorScheme): Promise<void> {
  if (isIndexedDBAvailable()) {
    const db = await getDB()
    await db.put(STORE_NAME, scheme)
  } else {
    const all = lsGetAll()
    const idx = all.findIndex((s) => s.id === scheme.id)
    if (idx >= 0) {
      all[idx] = scheme
    } else {
      all.push(scheme)
    }
    lsSave(all)
  }
}

/** 获取所有保存的配色方案 */
export async function getAllSchemes(): Promise<SavedColorScheme[]> {
  if (isIndexedDBAvailable()) {
    const db = await getDB()
    return db.getAll(STORE_NAME)
  } else {
    return lsGetAll()
  }
}

/** 删除配色方案 */
export async function deleteScheme(id: string): Promise<void> {
  if (isIndexedDBAvailable()) {
    const db = await getDB()
    await db.delete(STORE_NAME, id)
  } else {
    const all = lsGetAll().filter((s) => s.id !== id)
    lsSave(all)
  }
}

/** 检查是否使用降级存储 */
export function isUsingFallback(): boolean {
  return !isIndexedDBAvailable()
}
