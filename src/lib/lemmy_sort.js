export function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}

export async function getLemmyPosts(params0, fetch) {
	let result0 = { params0: params0,
        failureCode: -1,
        failureText: "",
        json: {}
        };
	let serverURL0 = params0.serverChoice0 + params0.serverAPI0;
	const startTime = process.hrtime();
	let resp = await fetch(serverURL0);
	result0.timeConnect = parseHrtimeToSeconds(process.hrtime(startTime));
	if (resp.ok) {
		const queryTimeStart = process.hrtime();
		try {
			result0.json = await resp.json();
	    	// console.log(result0.json);
        } catch (e0) {
            console.error("JSON parse failed ", serverURL0);
            console.log(e0);
			result0.failureCode = -1000;
			result0.failureText = "JSON parse failure";
		}
		result0.timeParse = parseHrtimeToSeconds(process.hrtime(queryTimeStart))
	} else {
        console.error("fetch failed %s status %d %s", serverURL0, resp.status, resp.statusText);
		result0.failureCode = resp.status;
		result0.failureText = resp.statusText;
	}

	return result0;
}


export async function getLemmyPost(params0, fetch) {
    params0.serverAPI0 = "/api/v3/comment/list?post_id=${params.id}&limit=10000&sort=New";
    return getLemmyPosts(params0, fetch);
}


export async function dualServerPostFetch(results) {
    // results.page = 1;

    results.server0params.serverAPI0 = "api/v3/post/list?sort=New&" + results.community + "&limit=50&page=" + results.page;
    results.outServer0 = await getLemmyPosts(results.server0params, fetch);

    results.server1params.serverAPI0 = "api/v3/post/list?sort=New&" + results.community + "&limit=50&page=" + results.page;
    results.outServer1 = await getLemmyPosts(results.server1params, fetch);

    results = checkErrorsDual(results);

    return results;
}


export async function dualServerPostCommentsFetch(results) {
    // results.page = 1;

    // so it seems lemmy.world has reduced limit of comment fetching to 50 from 300 on 2023-07-05 or past few days.
    let commentMax = 50;
    results.server0params.serverAPI0 = "api/v3/comment/list?post_id=" + results.server0params.postid + "&type_=All"
        + "&limit=" + commentMax
        + "&page=" + results.page
        + "&sort=New";
    results.outServer0 = await getLemmyPosts(results.server0params, fetch);

    results.server1params.serverAPI0 = "api/v3/comment/list?post_id=" + results.server1params.postid + "&type_=All"
        + "&limit=" + commentMax
        + "&page=" + results.page
        + "&sort=New";
    results.outServer1 = await getLemmyPosts(results.server1params, fetch);

    results = checkErrorsDual(results);

    return results;
}


export function checkErrorsSingle(results) {
    results.fetchErrors = 0;
    if (results.failureCode != -1) {
        results.fetchErrors += 1;
    }
    if (results.json.error) {
        results.fetchErrors += 2;
    }
    return results;
}


export function checkErrorsDual(results) {
    results.fetchErrors = 0;
    if (results.outServer0.failureCode != -1) {
        results.fetchErrors += 1;
    }
    if (results.outServer0.json.error) {
        results.fetchErrors += 2;
    }
    if (results.outServer1.failureCode != -1) {
        results.fetchErrors += 4;
    }
    if (results.outServer1.json.error) {
        results.fetchErrors += 8;
    }
    return results;
}


function showPerf(results) {
    console.log("timeConnect %d timeParse %d server %s", results.timeConnect, results.timeParse, results.params0.serverChoice0);
}


export async function checkPostsComments(results, fetch, posts0, serverChoice) {
    for (let i = 0; i < posts0.length; i++) {
        let newParams = {};
        newParams.serverChoice0 = serverChoice;
        let commentMax = 50;
        newParams.serverAPI0 = "api/v3/comment/list?post_id=" + posts0[i].post.id + "&limit=" + commentMax + "&type_=All&sort=New";
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
}


export function matchPostsBy_ap_id(posts0, posts1) {
    let results = {
        resultsA: [],
        resultsB: [],   // exclude "same" matches, shorter list
        unfoundA: [],
        sameID: [],
        sameA: [],      // array should have equal items to sameID
        mergedA: [],    // array will merge posts0/posts1 and try to match by published
    };

    /*
    let highestLength = posts0.length;
    if (posts1.length > posts0.length) {
        highestLength = posts1.length;
    }

    for (let i = 0; i < highestLength; i++) {
        if (i > posts0.length) {
            results.merged.push(posts1[i]);
            break;
        }
        if (i > posts1.length) {
            results.merged.push(posts0[i]);
            break;
        }

        if (posts0[i].post.ap_id == posts1[i].post.ap_id) {
            results.merged.push(posts0[i]);
            results.merged.push(posts1[i]);
        } else {
            if (new Date(posts0[i].post.published) > new Date(posts1[i].post.published)) {
                results.merged.push(posts0[i]);
            } else {
                results.merged.push(posts1[i]);
            }
        }
    }
    */

    results.mergedA = posts0.concat(posts1);

    results.mergedA.sort( (a,b) => {
        if (new Date(a.post.published) < new Date(b.post.published)) return 1;
        if (new Date(a.post.published) > new Date(b.post.published)) return -1;
        return 0;
    });

    let onJ = -1;
    for (let i = 0; i < posts0.length; i++) {
        let foundMatch = false;
        // ToDo: start j value on onJ instead of 0?
        for (let j = 0; j < posts1.length; j++) {
            if (posts0[i].post.ap_id == posts1[j].post.ap_id) {
                // ap_id match, now title?
                if (posts0[i].post.name === posts1[j].post.name) {
                    results.resultsA.push(i + ":" + j + ":same");
                    results.sameID.push([ posts0[i].post.id, posts1[j].post.id] );
                    results.sameA.push(posts0[i]);
                    foundMatch = true;
                    if (j != onJ + 1) {
                        results.resultsA.push(i + ":" + j + ":SKIP?" + onJ + "?");
                        results.resultsB.push(i + ":" + j + ":SKIP?" + onJ + "?");
                        results.unfoundA.push(posts1[onJ + 1]);
                    }
                    onJ = j;
                    // abort j loop
                    break;
                } else {
                    results.resultsA.push(i + ":" + j + ":title");
                    results.resultsB.push(i + ":" + j + ":title");
                }
            } else {
                // resultsA.push(i + ":time");
            }
        }
        if (!foundMatch) {
            results.resultsA.push(i + "unfound");
            results.resultsB.push(i + "unfound");
            results.unfoundA.push(posts0[i]);
        }
    }

    if (posts0.length < posts1.length) {
        const extraCount = posts1.length - posts0.length;
        results.resultsA.push("extras:" + extraCount)
        results.resultsB.push("extras:" + extraCount)
    }

    if ((posts1.length - 1) > onJ) {
        const extraCount = posts1.length - 1 - onJ
        results.resultsA.push("extrasOnJ:" + extraCount)
        results.resultsB.push("extrasOnJ:" + extraCount)
    }

    return results;
}
