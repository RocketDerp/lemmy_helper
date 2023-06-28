import { lemmyLogin, lemmyCommentLike } 
   from "../src/lib/lemmy_session.js"


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
