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

    console.log(matchResults.resultsB);
    consolePosts(matchResults.unfoundA);

}


function consolePosts(postArray) {
    for (let i = 0; i < postArray.length; i++) {
        let post = postArray[i].post;
        if (post.url) {
            console.log("%d %s %s url %s", post.id, post.published, post.name, post.url);
        } else {
            console.log("%d %s %s", post.id, post.published, post.name);
        }
    }
}
