import { serverFetchJSON0 } from "./lemmy_session.js";


export async function lemmyCommunities(params0, fetcha) {
    // http://lemmy:8536/api/v3/community/list?type_=Local&sort=Hot&limit=6&auth
    // 50 is limit for fetch
    params0.serverURLpath0 = "api/v3/community/list?type_=Local&sort=MostComments&limit="
        + params0.limit
        + "&page=" + params0.page
        + "&show_nsfw=true"
        ;

    let result0 = serverFetchJSON0(params0, fetcha);
    return result0;
}


export async function consoleCommunityList(communities0) {
    for (let i = 0; i < communities0.length; i++) {
        const c = communities0[i];
        if (i==0) {
            // console.log(c);
        }
        console.log("%d %s %s instance_id %d comments %d posts %d", c.community.id, c.community.name, c.community.published,
            c.community.instance_id, c.counts.comments, c.counts.posts);
    }
}


/*
Searching for a community in Lemmy invovles resolving an object.

Code to search for a community is in testing script:
https://github.com/LemmyNet/lemmy/blob/main/api_tests/src/community.spec.ts
https://github.com/LemmyNet/lemmy/blob/main/api_tests/src/shared.ts#L343

  format: `!${communityRes.community_view.community.name}@lemmy-beta:8551`


// GET /api/v3/search?q=performance&type_=Communities&sort=TopAll&listing_type=All&page=1&limit=40

*/
export async function searchCommunities(params0, fetcha) {
    params0.serverURLpath0 = "api/v3/search?q="  + params0.queryCommunityname + "&type_=Communities&sort=TopAll&listing_type=All&page=1&limit=50&show_nsfw=true";
    /*
    params0.fetchMethod = "GET";
    params0.bodyJSON0 = JSON.stringify( {
        q: "!" + params0.queryCommunityname,
        auth: params0.jwt,
      } );
      */
  
    let result0 = serverFetchJSON0(params0, fetcha);
    return result0;
}


export async function resolveCommunity(params0, fetcha) {
    params0.serverURLpath0 = "api/v3/resolve_object?q="  + params0.queryCommunityname
        + "&auth=" + params0.jwt;
    /*
    params0.fetchMethod = "GET";
    params0.bodyJSON0 = JSON.stringify( {
        q: "!" + params0.queryCommunityname,
        auth: params0.jwt,
      } );
      */
  
    let result0 = serverFetchJSON0(params0, fetcha);
    return result0;
}
