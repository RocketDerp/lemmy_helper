import { dualServerPostFetch, matchPosts, checkPostsComments, getLemmyPosts, checkErrorsSingle, dualServerPostCommentsFetch }
   from "../src/lib/lemmy_sort.js"
import { compareCommentsPostsListID, compareTwoCommentsSamePost, convertToComments, convertToTree } 
   from "../src/lib/lemmy_comments.js"


function showPerf(results) {
    console.log("timeConnect %d timeParse %d server %s", results.timeConnect, results.timeParse, results.params0.serverChoice0);
}


export async function posts (communityname, server0, server1) {
    console.log("posts");
    let results = { community: "community_name=" + communityname,
        page: 1,
        server0params: { serverChoice0: server0 },
        server1params: { serverChoice0: server1 }
     };
    /*
    results.community = "community_name=fediverse@lemmy.ml";
    results.community = "community_name=memes@lemmy.ml";
    results.community = "community_name=technology@lemmy.ml";
    results.community = "community_name=linux@lemmy.ml";
    results.community = "community_name=reddit@lemmy.ml";
    results.community = "community_name=worldnews@lemmy.ml";
    results.community = "community_name=mlemapp@lemmy.ml";
    results.community = "community_name=lemmyworld@lemmy.world";
    results.community = "community_name=nostupidquestions@lemmy.world";
    results.community = "community_name=selfhosted@lemmy.world";
    results.community = "community_name=mildlyinfuriating@lemmy.world";
    results.community = "community_name=asklemmy@lemmy.ml";
    */
    results = await dualServerPostFetch(results);

    showPerf(results.outServer0);
    showPerf(results.outServer1);

    if (results.fetchErrors > 0) {
        console.log("ERROR on fetch: ", results.fetchErrors);
    } else {
        let matchResults = matchPosts(results.outServer0.json.posts, results.outServer1.json.posts);

        console.log(matchResults.resultsB);
        //consolePosts(matchResults.unfoundA);

        console.log("------------ comments of posts ==============");
        //console.log(matchResults.sameID);
        // compareCommentsPostsListID(matchResults.sameID);

        for (let i = 0; i < matchResults.sameID.length; i++) {
            console.log("---- POSTS %d %s %s", i, matchResults.sameID[i], matchResults.sameA[i].post.name);
            let commentsMatch = await compareComments(server0, matchResults.sameID[i][0], server1, matchResults.sameID[i][1]);
        }
        // await checkPostsComments(results, fetch, results.outServer0.json.posts, results.server0params.serverChoice0);
        // await checkPostsComments(results, fetch, results.outServer1.json.posts, results.server1params.serverChoice0);
    }
}


export async function testPost(postID, serverChoice) {
    console.log("testPost function");

    let newParams = {};
    newParams.serverChoice0 = "https://sh.itjust.works/";
    if (serverChoice) {
        newParams.serverChoice0 = serverChoice;
    }
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
    return postResults;
}


export async function rawPost(postID, serverChoice) {
    let newParams = { serverChoice0: serverChoice };
    newParams.serverAPI0 = "api/v3/comment/list?post_id=" + postID + "&type_=All&limit=300&sort=New";
    console.log(newParams.serverAPI0);
    let postResults = await getLemmyPosts(newParams, fetch);
    postResults = checkErrorsSingle(postResults);
    if (postResults.fetchErrors == 0) {
        showPerf(postResults);
        console.log("Comment count %d", postResults.json.comments.length);
        console.log(postResults.json);
    } else {
        console.error("fetchErrors ", postResults.fetchErrors);
        console.log(postResults);
    }
    return postResults;
}


export async function testPost2() {
    console.log("testPost2 function - testing comments for a post");
    let errorCount = 0;
    for (let i = 0; i < 1; i++) {
        // let postResults = await testPost(1197481, "https://lemmy.ml/");
        let postResults = await testPost(123406);
        await new Promise(r => setTimeout(r, 2000));
        if (postResults.fetchErrors != 0) {
            errorCount++;
        }
        if (i % 10 ==0) {
            let tree = convertToTree(postResults.json.comments);
            console.log("---============--- %d errorCount %d", i, errorCount);
        }
    }
    console.log("end of loop, errorCount %d", errorCount);
}


export async function compareComments(server0, post0, server1, post1) {
    let newParams = {
       server0params: { serverChoice0: server0, postid: post0 },
       server1params: { serverChoice0: server1, postid: post1 } 
       };
    newParams.server0params.serverAPI0 = "api/v3/comment/list?post_id=" + post0 + "&type_=All&limit=300&sort=New";

    newParams = await dualServerPostCommentsFetch(newParams);
    showPerf(newParams.outServer0);
    showPerf(newParams.outServer1);

    if (newParams.fetchErrors == 0) {
        //console.log("tree0 Comment count %d", newParams.outServer0.json.comments.length);

        //let tree0 = convertToTree(newParams.outServer0.json.comments);
        //console.log("----");
        //console.log("---- tree1:");
        //console.log("tree1 Comment count %d", newParams.outServer1.json.comments.length);
    
        //let tree1 = convertToTree(newParams.outServer1.json.comments);

        //console.log("--------------");
        //console.log("-------------------");
        if (newParams.outServer0.json.comments.length == 300) {
            console.log("missing skip post with 300 comments");
        } else {
            let d = compareTwoCommentsSamePost(newParams.outServer0.json.comments, newParams.outServer1.json.comments);
            //console.log("commentMissing %d unequal %d server0 %d server1 %d %s %s  ", d.commentMissing.length,
            //    d.commentUnequal.length, d.comments.length, d.comments1.length,
            //    server0 + "post/" + post0, server1  + "post/" + post1
            //)

            // markdown for GitHub and Lemmy
            // [title](https://www.example.com)
            console.log("missing %d unequal %d [%d on %s](%s) vs. [%d on %s](%s)  ",
                d.commentMissing.length,
                d.commentUnequal.length,
                d.comments.length, server0, server0 + "post/" + post0,
                d.comments1.length, server1, server1  + "post/" + post1
            )
        }
    } else {
        console.log("fetchErrors: %d", newParams.fetchErrors);
    }
    return newParams;
}


export async function loopTest0() {
    console.log("looptest0 function");
    let errorCount = 0;
    for (let i = 0; i < 1000; i++) {
        let postResults = await testPost(6, "https://lemmy.ml/");
        await new Promise(r => setTimeout(r, 2000));
        if (postResults.fetchErrors != 0) {
            errorCount++;
        }
        if (i % 10 ==0) {
            console.log("---============--- %d errorCount %d", i, errorCount);
        }
    }
    console.log("end of loop, errorCount %d", errorCount);
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
