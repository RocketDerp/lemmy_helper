<script>
	import LemmyPostsList from "./LemmyPostsList.svelte"
	import { matchPosts } from "../../lib/lemmy_sort.js"
	export let outServers

	const posts0 = outServers.outServer0.json.posts;
	const posts1 = outServers.outServer1.json.posts;
	const rowCount0 = posts0.length;
	const rowCount1 = posts1.length;

	let matchResults = matchPosts(posts0, posts1);

	function pilePostsA(inPile) {
		let results = [];
		for (let i = 0; i < inPile.length; i++) {
			results.push({ id: inPile[i].post.id,
				name: inPile[i].post.name,
				published: inPile[i].post.published
			 });
		}
		return results;
	}


</script>

Database result row counts: {rowCount0} vs. {rowCount1}


<hr />

ResultsA: {JSON.stringify(matchResults.resultsA)}
<br />
UnfoundA: {JSON.stringify(pilePostsA(matchResults.unfoundA))}

<hr />
Unfound:<br />

<LemmyPostsList items={matchResults.unfoundA} />


<style>
</style>
