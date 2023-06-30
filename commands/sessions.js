import { lemmyLogin, lemmyCommentLike } 
    from "../src/lib/lemmy_session.js"
import { consoleCommunityList, lemmyCommunities, resolveCommunity, searchCommunities }
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
    for (let i = 0; i < 1000; i++) {
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
            outComment = " vote " + result.json.comment_view.my_vote;
        }

        console.log("%d timeConnect %d timeParse %d errorCount %s %s %s",
          i, result.timeConnect, result.timeParse, errorCount, params0.server, outComment);

        await new Promise(r => setTimeout(r, params0.looppause));
    }
    console.log("end of loop, errorCount %d", errorCount);

    console.log(result);
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
*/
export async function testCommunitiesTickle(params0) {
    // ToDo: loop pages
    let result = await lemmyCommunities( {
        serverChoice0: params0.server0,
    } );

    if (result.failureCode == -1) {
        let communities = result.json.communities;
        console.log("communities %d", communities.length);
        consoleCommunityList(communities);

        let hostname = simplifyServerName(params0.server0);
        console.log("======= RESOLVING %d from @ %s on targer server %s", communities.length, hostname, params0.server1);
        let errorCount = 0;
        let errorPile = [];
        for (let i = 0; i < communities.length; i++) {
            let fullCommunityname = "!" + communities[i].community.name + "@" + hostname;
            let resultResolve = await resolveCommunity( {
                serverChoice0: params0.server1,
                queryCommunityname: fullCommunityname,
                jwt: params0.jwt
            } );
        
            if (resultResolve.failureCode == -1) {
                let rc = resultResolve.json.community;
                console.log("resolve id %d name %s from %s errorCount %d", rc.community.id, rc.community.name, fullCommunityname, errorCount);
            } else {
                console.log(resultResolve);
                errorCount++;
                errorPile.push(fullCommunityname);
                await new Promise(r => setTimeout(r, 3000));
            }
        }
        console.log("finished, errorCount %d", errorCount);
        if (errorCount > 0) {
            console.log(errorPile);
        }
    } else {
        console.log(result);
    }
}
