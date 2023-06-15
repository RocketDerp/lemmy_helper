import type { PageServerLoad } from './$types'
import { Client } from 'pg'


export const load: PageServerLoad = async (incoming) => {

	let sqlQuery;
	let outRows = {};
	let outRowsRaw = [];

	// this switch statement gurads the parameter, only whitelist matching.
	switch (incoming.params.name) {
		case "test1":
			sqlQuery = 'SELECT $1::text as message', ['Hello world!'];
			break;
		case "locks":
			sqlQuery = "select * from pg_locks;";
			break;
		case "communitypending":
			sqlQuery = "SELECT * FROM community_follower WHERE pending='t';"
			break;
		default:
			console.error("/routes/query did not recognize params ER001");
			console.log(incoming.params);
			return {
				queryName: "error, unrecognized query name, ER001",
				outRows: {},
				outRowsRaw: []
			}
	}

    if (sqlQuery) {
		const client = new Client()
		await client.connect()
		
		try {
			const res = await client.query(sqlQuery)
			console.log(res.rows[0].message) // Hello world!
			outRows = JSON.stringify(res.rows);
			outRowsRaw = res.rows;
		} catch (err) {
			console.error(err);
		} finally {
			await client.end()
		}
	}

	return {
		queryName: incoming.params.name,
		outRows: outRows,
		outRowsRaw: outRowsRaw
	}
}
