import { lemmyLogin, lemmyCommentLike } 
    from "../src/lib/lemmy_session.js"
import { consoleCommunityList, followCommunity, lemmyCommunities, resolveCommunity, searchCommunities }
    from "../src/lib/lemmy_communities.js"


export async function testLemmyLogin(server, username, password) {
    let result = await lemmyLogin( {
        usernameOrEmail: username,
        password: password,
        serverChoice0: server
    });

    console.log(result);
}


export async function testVote(server, jwt) {
    let result = await lemmyCommentLike( {
        serverChoice0: server,
        jwt: jwt,
        vote: 1,
        comment_id: 1016688
    });

    console.log(result);
}


// options.server, options.jwt, parseInt(options.commentid)
export async function loopTestVote(params0) {
    let errorCount = 0;
    for (let i = 0; i < params0.loopiterations; i++) {
        let result = await lemmyCommentLike( {
            serverChoice0: params0.server,
            jwt: params0.jwt,
            vote: parseInt(params0.commentscore),
            comment_id: parseInt(params0.commentid)
        });

        let outComment = "";
        if (result.failureCode != -1) {
            errorCount++;
            outComment = " vote ERROR";
            console.log(result);
        } else {
            outComment = " vote " + result.json.comment_view.my_vote + " total " + result.json.comment_view.counts.score;
            //console.log(result.json.comment_view);
        }

        console.log("%d timeConnect %d errorCount %s %s%s",
          i, result.timeConnect, errorCount, params0.server, outComment);

        await new Promise(r => setTimeout(r, params0.looppause));
    }
    console.log("end of loop, errorCount %d server %s", errorCount, params0.server);
}


export async function testCommunities(params0) {
    let result = await lemmyCommunities( {
        serverChoice0: params0.server,
        jwt: params0.jwt
    } );

    if (result.failureCode == -1) {
        console.log("communities %d", result.json.communities.length);
        consoleCommunityList(result.json.communities);
    } else {
        console.log(result);
    }

    testSearchCommunity(params0);
}


export async function testSearchCommunity(params0) {
    let result = await searchCommunities( {
        serverChoice0: params0.server,
        queryCommunityname: "asklemmy",
        jwt: params0.jwt
    } );

    if (result.failureCode == -1) {
        console.log("communities %d", result.json.communities.length);
        consoleCommunityList(result.json.communities);
    } else {
        console.log(result);
    }
}


/*
Requires being logged-in to server
*/
export async function testResolveCommunity(params0) {
    let result = await resolveCommunity( {
        serverChoice0: params0.server,
        queryCommunityname: "!asklemmy@lemmy.ml",
        jwt: params0.jwt
    } );

    if (result.failureCode == -1) {
        console.log(result.json.community);
    } else {
        console.log(result);
    }
}


export function simplifyServerName(fullURL) {
    var url = new URL(fullURL);
    return url.hostname;
}


/*
Find list of local communities on server0 and tickle server1 to discover them.
Requires being logged-in to server1
Optional to follow the community on server1 after tickle to discover community.
*/
export async function testCommunitiesTickle(params0) {
    let finalPage = false;
    let errorItemCount = 0;
    let errorPageCount = 0;
    let errorFollowCount = 0;
    let errorPile = [];
    let onPage = 1;

    while (!finalPage) {
        let result = await lemmyCommunities( {
            serverChoice0: params0.server0,
            page: onPage,
            limit: 50
        } );

        if (result.failureCode == -1) {
            let communities = result.json.communities;
            if (communities.length == 0) {
                console.log("detected zero items on page %d", onPage);
                finalPage = true;
                // abort the loop, kind of defeats the purpose of a while loop, eh?
                break;
            }
            console.log("communities %d onPage %d", communities.length, onPage);
            consoleCommunityList(communities);

            let hostname = simplifyServerName(params0.server0);
            console.log("======= RESOLVING %d from @ %s page %d on targer server %s", communities.length, hostname, onPage, params0.server1);

            for (let i = 0; i < communities.length; i++) {
                let fullCommunityname = "!" + communities[i].community.name + "@" + hostname;
                let resultResolve = await resolveCommunity( {
                    serverChoice0: params0.server1,
                    queryCommunityname: fullCommunityname,
                    jwt: params0.jwt
                } );
            
                if (resultResolve.failureCode == -1) {
                    let rc = resultResolve.json.community;

                    let outFollow = "";
                    let doFollow = params0.follow;
                    let unfollowFirst = false;
                    if (params0.fastfollow) {
                        if (rc.subscribed === "Subscribed") {
                            doFollow = false;
                            if (params0.follow) {
                                outFollow = " ALREADY_FOLLOWED"
                            }
                        } else if (rc.subscribed === "Pending") {
                            doFollow = false;
                            if (params0.follow) {
                                outFollow = " ALREADY_PENDING"
                                unfollowFirst = true;
                            }
                        }
                    }

                    if (doFollow) {
                        // extra sleep for follow since two rapid transactions with server1
                        await new Promise(r => setTimeout(r, 1000));

                        if (unfollowFirst) {
                            console.log("unfollow first");
                            let unfollowResult = await followCommunity( {
                                serverChoice0: params0.server1,
                                community_id: rc.community.id,
                                follow: false,
                                jwt: params0.jwt
                                } );
                                await new Promise(r => setTimeout(r, 1000));
                        }
                        let followResult = await followCommunity( {
                            serverChoice0: params0.server1,
                            community_id: rc.community.id,
                            follow: true,
                            jwt: params0.jwt
                            } );
    
                        if (followResult.failureCode == -1) {
                            outFollow = " followed";
                            if (rc.subscribed !== "NotSubscribed") {
                                outFollow += "(prev:" + rc.subscribed + ")"
                            }
                            outFollow += " subs " + followResult.json.community_view.counts.subscribers
                            // console.log(followResult.json.community_view);
                        } else {
                            outFollow = " ERROR_IN_FOLLOW";
                            errorFollowCount++;
                            console.log("ERROR in follow");
                            console.log(followResult);
                        }
                    }
                    console.log("resolve id %d name %s from %s errorCount %d%s", rc.community.id, rc.community.name, fullCommunityname, errorItemCount, outFollow);
                } else {0
                    console.log(resultResolve);
                    errorItemCount++;
                    errorPile.push(fullCommunityname);
                    // Sleep to slow down loop for console operator
                    await new Promise(r => setTimeout(r, 5000));
                }

                if (i % 10 == 9) {
                    // Sleep to slow down loop for rate limit on local instance
                    console.log("zzzzz 3000");
                    await new Promise(r => setTimeout(r, 3000));
                }
            }
        } else {
            errorPageCount++;
            console.error("failed to fetch page %d", onPage);
            console.log(result);
        }

        // Sleep to slow down loop for rate limit on local instance
        console.log("zzzzzz 10000 finished onPage %d", onPage);
        await new Promise(r => setTimeout(r, 10000));
        onPage++;
    }

    console.log("finished, onPage %d errorPageCount (skipped pages) %d errorCount %d errorFollowCount %d",
        onPage, errorPageCount, errorItemCount, errorFollowCount);
    if (errorItemCount > 0) {
        console.log(errorPile);
    }
}
