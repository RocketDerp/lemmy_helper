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
			sqlQuery = "SELECT * FROM pg_locks;";
			break;
		case "communitypending":
			sqlQuery = "SELECT * FROM community_follower WHERE pending='t';"
			break;
		case 'communitypending1':
			sqlQuery = `SELECT person_id, p.name AS username, community_id, c.name as community, i.domain, community_follower.published
			FROM community_follower
			inner join person p on p.id = community_follower.person_id
			inner join community c on c.id = community_follower.community_id
			inner join instance i on c.instance_id = i.id
			WHERE pending='t'
			ORDER BY community_follower.published
			;`
			break;
		default:
			console.error("/routes/query did not recognize params ER001");
			console.log(incoming.params);
			return {
				queryName: "error, unrecognized query name, ER001",
				outRows: { rows: [] },
				outRowsRaw: []
			}
	}

    if (sqlQuery) {
		const client = new Client()
		await client.connect()
		
		try {
			const res = await client.query(sqlQuery)
			outRows = JSON.stringify(res.rows);
			outRowsRaw = res.rows;
		} catch (err) {
			console.error(err);
			return {
				queryName: "error, exception on query execution, ER002",
				outRows: { rows: [] },
				outRowsRaw: []
			}
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
