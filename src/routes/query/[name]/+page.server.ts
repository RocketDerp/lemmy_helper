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
		case 'posts':
			sqlQuery = `SELECT id, name, creator_id, community_id, published, updated,
			   ap_id, local 
			FROM post
			WHERE published >= NOW() - INTERVAL '1 HOUR'
			ORDER BY published
			;`
			break;
		case 'comments':
			sqlQuery = `SELECT id, post_id, published, ap_id, path
			FROM comment
			WHERE published >= NOW() - INTERVAL '1 HOUR'
			ORDER BY published
			;`
			break;
		case 'localusers':
			sqlQuery = `SELECT local_user.id, person_id, p.name as username, email, email_verified, accepted_application, validator_time
			FROM local_user
			inner join person p on p.id = local_user.person_id
			ORDER BY local_user.person_id
			;`
			break;
		case 'activity':
			sqlQuery = `SELECT id, *
			FROM activity
			WHERE id < 100
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

	let timeConnect = 0.0;
	let timeQuery = 0.0;

    if (sqlQuery) {
		const client = new Client()
		const startTime = process.hrtime();
		await client.connect()
		timeConnect = parseHrtimeToSeconds(process.hrtime(startTime))

		try {
			const queryTimeStart = process.hrtime();
			const res = await client.query(sqlQuery)
			timeQuery = parseHrtimeToSeconds(process.hrtime(queryTimeStart))
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
		outRowsRaw: outRowsRaw,
		timeQuery: timeQuery,
		timeConnect: timeConnect
	}
}

function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}
