import { dualServerPostFetch, matchPosts } from "../src/lib/lemmy_sort.js"

function showPerf(results) {
    console.log("timeConnect %d timeParse %d server %s", results.timeConnect, results.timeParse, results.params0.serverChoice0);
}

export async function posts () {
    console.log("posts");
    let results = {};
    results = await dualServerPostFetch(results);

    showPerf(results.outServer0);
    showPerf(results.outServer1);

    let matchResults = matchPosts(results.outServer0.json.posts, results.outServer1.json.posts);

    console.log(matchResults.resultsA);
}
