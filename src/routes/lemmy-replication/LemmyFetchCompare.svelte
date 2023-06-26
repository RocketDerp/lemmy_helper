<script>
	import LemmyPostsList from "./LemmyPostsList.svelte"
	import { matchPosts } from "../../lib/lemmy_sort.js"
	export let outServers

	let errorCount = 0;
	if (outServers.outServer0.json.error) {
		errorCount++;
	}
	if (outServers.outServer1.json.error) {
		errorCount++;
	}

	let matchResults = {
		rowCount0: -1,
		rowCount1: -1,
	};

	if (errorCount == 0) {
		const posts0 = outServers.outServer0.json.posts;
		const posts1 = outServers.outServer1.json.posts;

		matchResults = matchPosts(posts0, posts1);
	}

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

{#if errorCount == 0}


Database result row counts: {matchResults.rowCount0} vs. {matchResults.rowCount1}


<hr />

ResultsA: {JSON.stringify(matchResults.resultsA)}
<br />
UnfoundA: {JSON.stringify(pilePostsA(matchResults.unfoundA))}

<hr />
Unfound:<br />

<LemmyPostsList items={matchResults.unfoundA} />

{:else}

Errorcount {errorCount}<br />
Server0: {outServers.outServer0.json.error}<br />
Server1: {outServers.outServer1.json.error}<br />

{/if}

<style>
</style>