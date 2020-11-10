import { Pool, QueryResultRow, QueryResult } from 'pg'

const postgres = new Pool({
  user: 'g1927148_u',
  password: '1J5UVrmlIx',
  host: 'db.doc.ic.ac.uk',
  port: 5432,
  database: 'postgres',
  ssl: true
})

const pool = {

  query: <R extends QueryResultRow = any, I extends any[] = any[]>(
    queryText: string,
    values: I): Promise<QueryResult<R>> => {
    return new Promise((res, rej) => postgres.query(queryText, values, (qErr, qRes) => {
      if (qErr) {
        rej(qErr)
      }
      res(qRes)
    }))
  }

}



export default pool