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
        // console.log("communities %d", result.json.communities.length);
        // consoleCommunityList(result.json.communities);
    } else {
        console.log(result);
    }
}

