import { dualServerPostFetch, matchPosts, checkPostsComments, getLemmyPosts, checkErrorsSingle }
   from "../src/lib/lemmy_sort.js"


function showPerf(results) {
    console.log("timeConnect %d timeParse %d server %s", results.timeConnect, results.timeParse, results.params0.serverChoice0);
}


export async function posts () {
    console.log("posts");
    let results = {};
    results = await dualServerPostFetch(results);

    showPerf(results.outServer0);
    showPerf(results.outServer1);

    if (results.fetchErrors > 0) {
        console.log("ERROR on fetch: ", results.fetchErrors);
    } else {
        let matchResults = matchPosts(results.outServer0.json.posts, results.outServer1.json.posts);

        console.log(matchResults.resultsB);
        consolePosts(matchResults.unfoundA);

        await checkPostsComments(results, fetch);
    }
}


export async function testPost() {
    console.log("testPost function");

    let newParams = {};
    newParams.serverChoice0 = "https://sh.itjust.works/";
    let postID = 123406;
    // postID = 372144;
    newParams.serverAPI0 = "api/v3/comment/list?post_id=" + postID + "&limit=300&sort=New";
    console.log(newParams.serverAPI0);
    let postResults = await getLemmyPosts(newParams, fetch);
    postResults = checkErrorsSingle(postResults);
    if (postResults.fetchErrors == 0) {
        showPerf(postResults);
        console.log("Comment count %d", postResults.json.comments.length);
    } else {
        console.error("fetchErrors");
        console.log(postResults);
    }
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
