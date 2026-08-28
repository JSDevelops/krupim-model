import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import { attachDatabasePool } from '@vercel/functions'

type DbError = { message: string; code?: string }
// Compatibility boundary for legacy pages that previously relied on an untyped Local PostgreSQL client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbResult<T = any> = { data: any; error: DbError | null; readonly __type?: T }

export type DataOperation = {
  table: string
  action: 'select' | 'insert' | 'upsert' | 'update' | 'delete'
  columns?: string
  values?: Record<string, unknown> | Record<string, unknown>[]
  filters?: Array<{ type: 'eq' | 'in'; column: string; value: unknown }>
  order?: { column: string; ascending: boolean }
  limit?: number
  mode?: 'many' | 'single' | 'maybeSingle'
  onConflict?: string
  returning?: boolean
}

const globalForDatabase = globalThis as typeof globalThis & { __krupimPool?: Pool }

function integerEnvironment(name: string, fallback: number, minimum: number, maximum: number) {
  const value = Number(process.env[name])
  return Number.isInteger(value) && value >= minimum && value <= maximum ? value : fallback
}

function sslConfiguration() {
  const mode = process.env.DATABASE_SSL?.trim().toLowerCase()
  if (mode !== 'require') return undefined
  return { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase() !== 'false' }
}

function getPool() {
  const connectionString = process.env.DATABASE_URL || ''
  if (!connectionString) throw new Error('DATABASE_URL is not configured')

  if (!globalForDatabase.__krupimPool) {
    // A Vercel deployment can create several warm function instances. Keep each
    // instance's pool deliberately small so they do not exhaust Railway Postgres.
    const defaultPoolMax = process.env.VERCEL ? 2 : 10
    const pool = new Pool({
      connectionString,
      ssl: sslConfiguration(),
      application_name: process.env.APP_SERVICE_NAME?.trim() || 'krupim-next-fullstack',
      max: integerEnvironment('DATABASE_POOL_MAX', defaultPoolMax, 1, 50),
      idleTimeoutMillis: integerEnvironment('DATABASE_POOL_IDLE_TIMEOUT_MS', 30_000, 1_000, 300_000),
      connectionTimeoutMillis: integerEnvironment('DATABASE_CONNECTION_TIMEOUT_MS', 5_000, 1_000, 60_000),
    })
    if (process.env.VERCEL) attachDatabasePool(pool)
    globalForDatabase.__krupimPool = pool
  }
  return globalForDatabase.__krupimPool
}

export async function queryDb<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values)
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

function identifier(value: string) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new Error(`Invalid SQL identifier: ${value}`)
  return `"${value}"`
}

function selectList(columns = '*') {
  if (columns.trim() === '*') return '*'
  return columns.split(',').map(column => identifier(column.trim())).join(', ')
}

const JSON_COLUMNS: Record<string, Set<string>> = {
  fine_lesson_plans: new Set(['objectives_k', 'objectives_s', 'objectives_a', 'objectives_ap', 'vocabulary', 'sentences']),
  chat_sessions: new Set(['messages_json']),
  simulation_sessions: new Set(['feedback_json', 'conversation_json']),
  simulation_scenarios: new Set(['script_json', 'rubric_json']),
  assessments: new Set(['rubric_json']),
}

function databaseValue(table: string, column: string, value: unknown) {
  if (value !== null && value !== undefined && JSON_COLUMNS[table]?.has(column)) {
    return JSON.stringify(value)
  }
  return value
}

const DEFAULT_CONFLICT: Record<string, string> = {
  profiles: 'id',
  fine_lesson_plans: 'id',
  class_invites: 'short_code',
  ar_items: 'id',
  vocabulary_items: 'name_en',
  ai_scan_items: 'name_en',
}

function buildFilters(
  table: string,
  filters: DataOperation['filters'],
  params: unknown[],
) {
  const clauses: string[] = []
  for (const filter of filters || []) {
    const column = identifier(filter.column)
    if (filter.type === 'eq') {
      if (filter.value === null) clauses.push(`${column} IS NULL`)
      else {
        params.push(databaseValue(table, filter.column, filter.value))
        clauses.push(`${column} = $${params.length}`)
      }
    } else {
      if (!Array.isArray(filter.value) || filter.value.length === 0) {
        clauses.push('FALSE')
      } else {
        const placeholders = filter.value.map(value => {
          params.push(databaseValue(table, filter.column, value))
          return `$${params.length}`
        })
        clauses.push(`${column} IN (${placeholders.join(', ')})`)
      }
    }
  }
  return clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''
}

function normalizeRows(values: DataOperation['values']) {
  if (!values) throw new Error('Mutation values are required')
  const rows = Array.isArray(values) ? values : [values]
  if (rows.length === 0) throw new Error('Mutation values cannot be empty')
  return rows
}

function mutationMatrix(table: string, rows: Record<string, unknown>[], params: unknown[]) {
  const columns = Object.keys(rows[0])
  if (columns.length === 0) throw new Error('Mutation values cannot be empty')
  columns.forEach(identifier)

  const matrix = rows.map(row => {
    if (columns.some(column => !(column in row))) throw new Error('All mutation rows must contain the same columns')
    return `(${columns.map(column => {
      params.push(databaseValue(table, column, row[column]))
      return `$${params.length}`
    }).join(', ')})`
  })
  return { columns, matrix }
}

export async function executeOperation<T extends QueryResultRow = QueryResultRow>(operation: DataOperation): Promise<DbResult<T>> {
  try {
    const table = identifier(operation.table)
    const params: unknown[] = []
    let sql = ''

    if (operation.action === 'select') {
      sql = `SELECT ${selectList(operation.columns)} FROM ${table}`
      sql += buildFilters(operation.table, operation.filters, params)
      if (operation.order) {
        sql += ` ORDER BY ${identifier(operation.order.column)} ${operation.order.ascending ? 'ASC' : 'DESC'}`
      }
      const limit = Math.min(Math.max(operation.limit ?? 500, 1), 1_000)
      sql += ` LIMIT ${limit}`
    } else if (operation.action === 'insert' || operation.action === 'upsert') {
      const rows = normalizeRows(operation.values)
      const { columns, matrix } = mutationMatrix(operation.table, rows, params)
      sql = `INSERT INTO ${table} (${columns.map(identifier).join(', ')}) VALUES ${matrix.join(', ')}`

      if (operation.action === 'upsert') {
        const conflictColumns = (operation.onConflict || DEFAULT_CONFLICT[operation.table] || 'id')
          .split(',').map(column => column.trim())
        conflictColumns.forEach(identifier)
        const updateColumns = columns.filter(column => !conflictColumns.includes(column))
        sql += ` ON CONFLICT (${conflictColumns.map(identifier).join(', ')}) `
        sql += updateColumns.length
          ? `DO UPDATE SET ${updateColumns.map(column => `${identifier(column)} = EXCLUDED.${identifier(column)}`).join(', ')}`
          : 'DO NOTHING'
      }
      sql += ` RETURNING ${selectList(operation.columns)}`
    } else if (operation.action === 'update') {
      const [row] = normalizeRows(operation.values)
      const columns = Object.keys(row)
      if (!operation.filters?.length) throw new Error('Refusing an unfiltered update')
      sql = `UPDATE ${table} SET ${columns.map(column => {
        params.push(databaseValue(operation.table, column, row[column]))
        return `${identifier(column)} = $${params.length}`
      }).join(', ')}`
      sql += buildFilters(operation.table, operation.filters, params)
      sql += ` RETURNING ${selectList(operation.columns)}`
    } else {
      if (!operation.filters?.length) throw new Error('Refusing an unfiltered delete')
      sql = `DELETE FROM ${table}`
      sql += buildFilters(operation.table, operation.filters, params)
      sql += ` RETURNING ${selectList(operation.columns)}`
    }

    const result = await queryDb<T>(sql, params)
    if (operation.mode === 'single' && result.rows.length !== 1) {
      return { data: null, error: { message: result.rows.length ? 'Multiple rows returned' : 'Row not found', code: 'PGRST116' } }
    }
    if (operation.mode === 'maybeSingle') {
      if (result.rows.length > 1) return { data: null, error: { message: 'Multiple rows returned', code: 'PGRST116' } }
      return { data: result.rows[0] ?? null, error: null }
    }
    if (operation.mode === 'single') return { data: result.rows[0], error: null }
    return { data: result.rows, error: null }
  } catch (error) {
    const dbError = error as Error & { code?: string }
    return { data: null, error: { message: dbError.message, code: dbError.code } }
  }
}

export class LocalQueryBuilder<T extends QueryResultRow = QueryResultRow> implements PromiseLike<DbResult<T>> {
  private operation: DataOperation

  constructor(table: string) {
    this.operation = { table, action: 'select', columns: '*', filters: [], mode: 'many' }
  }

  select(columns = '*') {
    this.operation.columns = columns
    if (this.operation.action === 'select') this.operation.returning = true
    return this
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation.action = 'insert'
    this.operation.values = values
    return this
  }

  upsert(values: Record<string, unknown> | Record<string, unknown>[], options?: { onConflict?: string }) {
    this.operation.action = 'upsert'
    this.operation.values = values
    this.operation.onConflict = options?.onConflict
    return this
  }

  update(values: Record<string, unknown>) {
    this.operation.action = 'update'
    this.operation.values = values
    return this
  }

  delete() {
    this.operation.action = 'delete'
    return this
  }

  eq(column: string, value: unknown) {
    this.operation.filters?.push({ type: 'eq', column, value })
    return this
  }

  in(column: string, values: unknown[]) {
    this.operation.filters?.push({ type: 'in', column, value: values })
    return this
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.operation.order = { column, ascending: options.ascending !== false }
    return this
  }

  limit(limit: number) {
    this.operation.limit = limit
    return this
  }

  single() {
    this.operation.mode = 'single'
    this.operation.limit = 2
    return this
  }

  maybeSingle() {
    this.operation.mode = 'maybeSingle'
    this.operation.limit = 2
    return this
  }

  toOperation() {
    return structuredClone(this.operation)
  }

  then<TResult1 = DbResult<T>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return executeOperation<T>(this.operation).then(onfulfilled, onrejected)
  }
}

export const localDb = {
  from<T extends QueryResultRow = QueryResultRow>(table: string) {
    return new LocalQueryBuilder<T>(table)
  },
}
