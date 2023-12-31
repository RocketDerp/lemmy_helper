import { dualServerPostFetch, matchPostsBy_ap_id, checkPostsComments, getLemmyPosts, checkErrorsSingle, dualServerPostCommentsFetch }
   from "../src/lib/lemmy_sort.js"
import { compareCommentsPostsListID, compareTwoCommentsSamePost, convertToComments, convertToTree,
     buildArrayOfCommentIdentifiers, formatAsMarkdownCommentIdentifiers } 
   from "../src/lib/lemmy_comments.js"


function showPerf(results) {
    console.log("timeConnect %d timeParse %d server %s", results.timeConnect, results.timeParse, results.params0.serverChoice0);
}


export async function fetchMultiplePosts(options) {
    let p = {
        posts0: [],
        posts1: [],
        fetchErrors: 0
    };

    // Lemmy is not very consistent on timing of pages, new items can push pages around
    //   fetch all the pages at once to try and get a consistent list to compare between servers.
    for (let onPage = 1; onPage <= options.postpages; onPage++) {
        let results = { community: "community_name=" + options.communityname,
            page: onPage,
            server0params: { serverChoice0: options.server0 },
            server1params: { serverChoice0: options.server1 }
        };

        results = await dualServerPostFetch(results);

        showPerf(results.outServer0);
        showPerf(results.outServer1);

        if (results.fetchErrors > 0) {
            console.log("ERROR on fetch: ", results.fetchErrors);
            console.error("aborting, error on fetch, page %d", onPage);
            // abort loop of pages
            p.fetchErrors = results.fetchErrors;
            return p;
        } else {
            p.posts0 = p.posts0.concat(results.outServer0.json.posts);
            p.posts1 = p.posts1.concat(results.outServer1.json.posts);
        }
    }

    return p;
}


export function stampPostsWithSource(p, server0, server1) {
    for (let i = 0; i < p.posts0.length; i++) {
        p.posts0[i].postsource = server0;
    }
    for (let i = 0; i < p.posts1.length; i++) {
        p.posts1[i].postsource = server1;
    }
    return p;
}


export async function posts (options) {
    let p = await fetchMultiplePosts(options);

    if (p.fetchErrors == 0) {
        p = stampPostsWithSource(p, options.server0, options.server1);
        let matchResults = matchPostsBy_ap_id(p.posts0, p.posts1);

        console.log(matchResults.resultsB);
        //consolePosts(matchResults.unfoundA);

        posts_list_twoservers_unique(matchResults);

        console.log("------------ comments of posts server0 has %d server1 %d ==============", p.posts0.length, p.posts1.length);
        //console.log(matchResults.sameID);
        // compareCommentsPostsListID(matchResults.sameID);

        console.log("| missing | diff | server0 | server1 | specific missing comments |");
        console.log("| ------: | ------: | :------ | :-----  | ---------------: |");
        for (let i = 0; i < matchResults.sameID.length; i++) {
            // console.log("---- POSTS %d %s %s", i, matchResults.sameID[i], matchResults.sameA[i].post.name);
            let commentsMatch = await compareCommentsMarkdownTable(options.server0, matchResults.sameID[i][0], options.server1, matchResults.sameID[i][1]);
        }
        // await checkPostsComments(results, fetch, results.outServer0.json.posts, results.server0params.serverChoice0);
        // await checkPostsComments(results, fetch, results.outServer1.json.posts, results.server1params.serverChoice0);
    }
}


export async function posts_list_twoservers_unique(matchResults) {
    let postsMerged = matchResults.mergedA;
    let sameSkipOne = false;
    let featuredCommunityCount = 0;
    let featuredLocalCount = 0;

    for (let i = 0; i < postsMerged.length; i++) {
        if (postsMerged[i].post.featured_community) {
            featuredCommunityCount++;
        }
        if (postsMerged[i].post.featured_local) {
            featuredLocalCount++;
        }

        if (sameSkipOne) {
            sameSkipOne = false;
        } else {
            if (i < (postsMerged.length - 1)) {
                let post0 = postsMerged[i];
                let post1 = postsMerged[i + 1];
                if (post0.post.ap_id === post1.post.ap_id) {
                    sameSkipOne = true;
                    console.log("SAME %s %s %s", post0.post.published, post0.post.ap_id, post0.post.name);
                } else {
                    // given they are sorted by published, the post0 is newer than post1
                    let outLink = post0.postsource + "post/" + post0.post.id;
                    console.log("DIFF %s %s", post0.post.published, post0.post.ap_id);
                    console.log("     FROM: %s %s", outLink, post0.post.name);
                    // console.log(post0);
                }
            } else {
                console.log("last one, i %d length %d", i, postsMerged.length);
            }
        }
    }
}


export async function posts_list_twoservers (options) {
    let p = await fetchMultiplePosts(options);

    if (p.fetchErrors == 0) {
        let matchResults = matchPostsBy_ap_id(p.posts0, p.posts1);
        let postsMerged = matchResults.mergedA;

        console.log(matchResults.resultsB);
        //consolePosts(matchResults.unfoundA);

        console.log("server0 %s count %d server1 %s count %d", options.server0, p.posts0.length, options.server1, p.posts1.length)

        let sameSkipOne = false;
        let featuredCommunityCount = 0;
        let featuredLocalCount = 0;

        for (let i = 0; i < postsMerged.length; i++) {
            if (postsMerged[i].post.featured_community) {
                featuredCommunityCount++;
            }
            if (postsMerged[i].post.featured_local) {
                featuredLocalCount++;
            }

            if (sameSkipOne) {
                sameSkipOne = false;
            } else {
                if (i < (postsMerged.length - 1)) {
                    let post0 = postsMerged[i];
                    let post1 = postsMerged[i + 1];
                    if (post0.post.ap_id === post1.post.ap_id) {
                        sameSkipOne = true;
                        console.log("SAME %s %s %s", post0.post.published, post0.post.ap_id, post0.post.name);
                    } else {
                        // given they are sorted by published, the post0 is newer than post1
                        console.log("DIFF %s %s %s %s", post0.post.published, post0.post.ap_id, post1.post.ap_id, post1.post.published);
                        console.log("     %s %s", post0.post.ap_id, post0.post.name);
                        //console.log(post0.post);
                    }
                } else {
                    console.log("last one, i %d length %d", i, postsMerged.length);
                }
            }
        }

        console.log("featured_community %d featured_local %d", featuredCommunityCount, featuredLocalCount);
    }
}


export async function testPost(options) {
    let newParams = {
        serverChoice0: options.server
    };
    newParams.serverAPI0 = "api/v3/comment/list?"
        + "post_id=" + options.postid
        + "&type_=All"
        + "&sort=" + options.orderby
        + "&limit=" + options.limit
        + "&page=" + options.page
    ;
    console.log(newParams);
    let postResults = await getLemmyPosts(newParams, fetch);
    postResults = checkErrorsSingle(postResults);
    if (postResults.fetchErrors == 0) {
        showPerf(postResults);
        let comments = postResults.json.comments;
        console.log("Comment count %d (limit was %d)", comments.length, options.limit);
        if (comments.length > 0) {
            console.log(comments[1]);
        }
    } else {
        console.error("fetchErrors ", postResults.fetchErrors);
        console.log(postResults);
    }
    return postResults;
}


export async function rawPost(postID, serverChoice) {
    let newParams = { serverChoice0: serverChoice };
    newParams.serverAPI0 = "api/v3/comment/list?post_id=" + postID + "&type_=All&limit=50&sort=New";
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


export async function compareComments(server0, post0, server1, post1) {
    let newParams = {
       server0params: { serverChoice0: server0, postid: post0 },
       server1params: { serverChoice0: server1, postid: post1 } 
       };
    newParams.server0params.serverAPI0 = "api/v3/comment/list?post_id=" + post0 + "&type_=All&limit=300&sort=New";

    newParams = await dualServerPostCommentsFetch(newParams);
    showPerf(newParams.outServer0);
    showPerf(newParams.outServer1);
    let commentMax = 50;

    if (newParams.fetchErrors == 0) {
        //console.log("tree0 Comment count %d", newParams.outServer0.json.comments.length);

        //let tree0 = convertToTree(newParams.outServer0.json.comments);
        //console.log("----");
        //console.log("---- tree1:");
        //console.log("tree1 Comment count %d", newParams.outServer1.json.comments.length);
    
        //let tree1 = convertToTree(newParams.outServer1.json.comments);

        //console.log("--------------");
        //console.log("-------------------");
        if (newParams.outServer0.json.comments.length == commentMax) {
            console.log("missing skip post with commentMax %d comments", commentMax);
        } else {
            let d = compareTwoCommentsSamePost(newParams.outServer0.json.comments, newParams.outServer1.json.comments);
            //console.log("commentMissing %d unequal %d server0 %d server1 %d %s %s  ", d.commentMissing.length,
            //    d.commentUnequal.length, d.comments.length, d.comments1.length,
            //    server0 + "post/" + post0, server1  + "post/" + post1
            //)

            let missingCommentsIdentifiers = buildArrayOfCommentIdentifiers(d.commentMissing);

            // markdown for GitHub and Lemmy
            // [title](https://www.example.com)
            console.log("missing %d unequal %d [%d on %s](%s) vs. [%d on %s](%s)  ",
                d.commentMissing.length,
                d.commentUnequal.length,
                d.comments.length, server0, server0 + "post/" + post0,
                d.comments1.length, server1, server1  + "post/" + post1
                )

            if (d.commentMissing.length > 0) {
                let missingInMarkdown = formatAsMarkdownCommentIdentifiers(missingCommentsIdentifiers);
                console.log("missing ap_id %s  ", missingInMarkdown);
            }
        }
    } else {
        console.log("fetchErrors: %d", newParams.fetchErrors);
    }
    return newParams;
}


export async function compareCommentsMarkdownTable(server0, post0, server1, post1) {
    const server0out = server0.replace("https://", "").replace("/", "");
    const server1out = server1.replace("https://", "").replace("/", "");
    let commentPageLimit = 50;
    let commentMax = 50;
    let server0Comments = [];
    let server1Comments = [];
    let fetchCommentPages = 10;

    let newParams = {
        server0params: { serverChoice0: server0, postid: post0 },
        server1params: { serverChoice0: server1, postid: post1 }
    };

    for (let onPage = 1; onPage <= fetchCommentPages; onPage++) {
        newParams.page = onPage;

        newParams = await dualServerPostCommentsFetch(newParams);
        //showPerf(newParams.outServer0);
        //showPerf(newParams.outServer1);

        if (newParams.fetchErrors == 0) {
            server0Comments = server0Comments.concat(newParams.outServer0.json.comments);
            server1Comments = server1Comments.concat(newParams.outServer1.json.comments);

            let doAnotherPage = false;
            if (newParams.outServer0.json.comments.length == commentPageLimit) {
                doAnotherPage = true;
            }
            if (newParams.outServer1.json.comments.length == commentPageLimit) {
                doAnotherPage = true;
            }

            if (!doAnotherPage) {
                // console.log("Stopping comment fetch onPage %d because did not reach limit", onPage);
                commentMax = commentPageLimit * onPage;
                break;
            }
        } else {
            console.log("fetchErrors: %d", newParams.fetchErrors);
            console.error("aborting comment fetch failed, page %d", onPage);
            return newParams;
        }
    }

    if (1==1) {
        let reachedMax = false;
        if (server0Comments.length == commentMax) {
            reachedMax = true;
        }
        if (server1Comments.length == commentMax) {
            reachedMax = true;
        }

        if (reachedMax) {
            console.log("| N/A | N/A | %d [%s](%s) | %d [%s](%s) | skip post with commentMax %d comments |",
                server0Comments.length, server0out, server0 + "post/" + post0,
                server1Comments.length, server1out, server1 + "post/" + post1,
                commentMax);
        } else {
            for (let i = 0; i < server0Comments.length; i++) {
                server0Comments[i].commentsource = server0;
            }
            for (let i = 0; i < server1Comments.length; i++) {
                server1Comments[i].commentsource = server1;
            }

            let d = compareTwoCommentsSamePost(server0Comments, server1Comments);
            let missingCommentsIdentifiers = buildArrayOfCommentIdentifiers(d.commentMissing);

            let missingInMarkdown = "ALL GOOD";
            if (d.commentUnequal.length > 0) {
                missingInMarkdown = "SOME Comment EDITS DIFF";
            }
            if (d.commentMissing.length > 0) {
                missingInMarkdown = formatAsMarkdownCommentIdentifiers(missingCommentsIdentifiers);
            }

            console.log("| %d | %d | [%d on %s](%s) | [%d on %s](%s) | %s |",
                d.commentMissing.length,
                d.commentUnequal.length,
                server0Comments.length, server0out, server0 + "post/" + post0,
                server1Comments.length, server1out, server1  + "post/" + post1,
                missingInMarkdown
                );
        }
    }

    return newParams;
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


export async function loopPostList(options) {
    let errorCount = 0;
    let postID = -1;

    for (let i = 0; i < options.loopiterations; i++) {
        let paramCommunity = "";
        if (options.communityname.length > 0) {
            paramCommunity =  "&community_name=" + options.communityname;
        }
        let results = {
            server0params: { serverChoice0: options.server },
        };

        results.server0params.serverAPI0 = "api/v3/post/list?"
           + "sort=" + options.orderby
           + paramCommunity
           + "&limit=" + options.limit
           + "&page=" + options.page
           ;
        results = await getLemmyPosts(results.server0params, fetch);

        let outDetail0 = "";
        if (results.failureCode != -1) {
            errorCount++;
            outDetail0 = " postlist ERROR";
            console.log(results);
        } else {
            let posts =  results.json.posts;
            outDetail0 = " posts " + posts.length;
            if (posts.length > 0) {
                let t = 0;
                let post = posts[t];

                // search the list of posts for the first one that is not featured, forced to top of New sort.
                for (let p = 0; p < posts.length; p++) {
                    if (!posts[p].post.featured_community) {
                        if (!posts[p].post.featured_local) {
                            t = p;
                            post = posts[p];
                            // exit loop
                            break;
                        }
                    }
                }

                if (parseInt(post.post.id) > postID) {
                    outDetail0 += " NEW";
                    postID = parseInt(post.post.id);
                }
                outDetail0 += " " + post.post.published
                  + " i " + t   // "i" for "index of post"
                  + " id " + post.post.id
                  + " " + post.post.name
            }
        }

        console.log("%d took %d error %s%s",
          i, results.timeConnect, errorCount, outDetail0);

        await new Promise(r => setTimeout(r, options.looppause));
    }

    console.log("end of loop, errorCount %d server %s", errorCount, options.server);
}
