import type { PageServerLoad } from './$types'
import { dualServerPostFetch } from '$lib/lemmy_sort'


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


	results = await dualServerPostFetch(results);


	return results;
}
