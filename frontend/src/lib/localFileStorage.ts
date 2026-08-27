import 'server-only'
import { unlink } from 'fs/promises'
import path from 'path'

const STORAGE_NAME = /^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/i

export async function removeLocalStoredFiles(storageNames: Array<string | null | undefined>) {
  const root = path.resolve(process.cwd(), '.data', 'uploads')
  await Promise.all(storageNames.map(async storageName => {
    if (!storageName || !STORAGE_NAME.test(storageName)) return
    const target = path.resolve(root, storageName)
    if (!target.startsWith(root + path.sep)) return
    await unlink(target).catch(() => undefined)
  }))
}
