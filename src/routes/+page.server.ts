import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (incoming) => {

	let output = "all"
	let timeperiod = 720;

	console.log("--------- nenu url")
	console.log(incoming.url)

	if (incoming.url.searchParams.get("output")) {
		output = incoming.url.searchParams.get("output");
	}

	if (incoming.url.searchParams.get("timeperiod")) {
		timeperiod = incoming.url.searchParams.get("timeperiod");
	}


    return { output: output, timeperiod: timeperiod }
}
