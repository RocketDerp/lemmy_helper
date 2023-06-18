export const load: PageServerLoad = async (incoming) => {

	let output = "all"

	console.log("--------- nenu url")
	console.log(incoming.url)

	if (incoming.url.searchParams.get("output")) {
		output = incoming.url.searchParams.get("output");
	}

    return { output: output }
}

