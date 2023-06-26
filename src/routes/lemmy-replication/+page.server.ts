import type { PageServerLoad } from './$types'


async function getLemmyPosts(params0) {
	let result0 = {};
	const startTime = process.hrtime();
	let serverURL0 = params0.serverChoice0 + params0.serverAPI0;
	let resp = await fetch(serverURL0);
	result0.timeConnect = parseHrtimeToSeconds(process.hrtime(startTime));
	if (resp.ok) {
		const queryTimeStart = process.hrtime();
		try {
			result0.json = await resp.json();
		} catch (e0) {
			result0.json = [];
			result0.failureCode = -1000;
			result0.failureText = "JSON parse failure";
		}
		result0.timeParse = parseHrtimeToSeconds(process.hrtime(queryTimeStart))
		// console.log(result0.json);
	} else {
		result0.json = [];
		result0.failureCode = resp.status;
		result0.failureText = resp.statusText;
	}

	return result0;
}


export const load: PageServerLoad = async (incoming) => {

	// This is experimental quick/dirty code, so some the workings are exposed ;)
	console.log("--------- url")
	console.log(incoming.url)

	let results = {
		name: "Compare0",
		output: "All"
	};

	// Optonal parameter
	// The HTML side of the page gets passed the output parameter, it isn't going into the SQL statements.
	if (incoming.url.searchParams.get("output")) {
		results.output = incoming.url.searchParams.get("output");
	};


    if (1==1) {
		results.server0params = { serverChoice0: "https://lemmy.world/",
		    serverAPI0: "api/v3/post/list?sort=New&community_name=asklemmy@lemmy.ml&limit=50&page=1",
		}
		    //serverAPI0: "api/v3/post/list?sort=New&type_=Local&limit=40&page=1",
			// Today I learned, til 16791
		    //serverAPI0 = "api/v3/post/list?sort=New&community_id=16791&limit=50page=1"
		results.outServer0 = await getLemmyPosts(results.server0params);
	};

	if (1==1) {
		results.server1params = { serverChoice0: "https://lemmy.ml/",
		    serverAPI0: "api/v3/post/list?sort=New&community_name=asklemmy@lemmy.ml&limit=50&page=1",
		}
		results.outServer1 = await getLemmyPosts(results.server1params);
	};


	return results;
}


function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}
