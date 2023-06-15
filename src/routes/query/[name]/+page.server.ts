import type { PageServerLoad } from './$types'
import { Client } from 'pg'


export const load: PageServerLoad = async (incoming) => {

	let sqlQuery;
	let outRows = {};

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
				outRows: {}
			}
	}

    if (sqlQuery) {
		const client = new Client()
		await client.connect()
		
		try {
			const res = await client.query()
			console.log(res.rows[0].message) // Hello world!
			outRows = JSON.stringify(res.rows);
		} catch (err) {
			console.error(err);
		} finally {
			await client.end()
		}
	}

	return {
		queryName: incoming.params.name,
		outrows: outRows
	}
}
