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

        // await checkPostsComments(results, fetch, results.outServer0.json.posts, results.server0params.serverChoice0);
        // await checkPostsComments(results, fetch, results.outServer1.json.posts, results.server1params.serverChoice0);
    }
}


export async function testPost() {
    console.log("testPost function");

    let newParams = {};
    newParams.serverChoice0 = "https://sh.itjust.works/";
    let postID = 123406;
    postID = 372144;
    newParams.serverAPI0 = "api/v3/comment/list?post_id=" + postID + "&type_=All&limit=300&sort=New";
    console.log(newParams.serverAPI0);
    let postResults = await getLemmyPosts(newParams, fetch);
    postResults = checkErrorsSingle(postResults);
    if (postResults.fetchErrors == 0) {
        showPerf(postResults);
        console.log("Comment count %d", postResults.json.comments.length);
    } else {
        console.error("fetchErrors ", postResults.fetchErrors);
        console.log(postResults);
    }
}


export async function testPost2() {
    console.log("testPost2 function");

    let newParams = {};
    newParams.serverChoice0 = "https://sh.itjust.works/";
    let postID = 123406;
    postID = 372144;
    newParams.serverAPI0 = "api/v3/post?id=" + postID + "&limit=300&sort=New";
    // Rust API code is logging this for lemmy-ui 0.18.0 https://l.com/post/47267
    // 'GET /api/v3/comment/list?max_depth=8&sort=Hot&type_=All&post_id=47267
    newParams.serverAPI0 = "api/v3/comment/list?max_depth=8&post_id=" + postID + "&sort=New";
    console.log(newParams.serverAPI0);
    let postResults = await getLemmyPosts(newParams, fetch);
    postResults = checkErrorsSingle(postResults);
    if (postResults.fetchErrors == 0) {
        showPerf(postResults);
        console.log(postResults);
        console.log("Comment count %d", postResults.json.comments.length);
    } else {
        console.error("fetchErrors");
        console.log(postResults);
    }
}


function consolePosts(postArray) {
    for (let i = 0; i < postArray.length; i++) {
        let post = postArray[i].post;
        let updateOut = "";
        if (post.published != post.updated) {
            updateOut = " updated[" + post.updated + "]";
        }
        if (post.url) {
            console.log("%d %s%s %s url %s %s", post.id, post.published, updateOut, post.name, post.url, post.ap_id);
        } else {
            console.log("%d %s%s %s", post.id, post.published, updateOut, post.name, post.ap_id);
        }
    }
}
