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
	const startTime = process.hrtime();
	let serverURL0 = params0.serverChoice0 + params0.serverAPI0;
	let resp = await fetch(serverURL0);
	result0.timeConnect = parseHrtimeToSeconds(process.hrtime(startTime));
	if (resp.ok) {
		const queryTimeStart = process.hrtime();
		try {
			result0.json = await resp.json();
	    	// console.log(result0.json);
        } catch (e0) {
			result0.failureCode = -1000;
			result0.failureText = "JSON parse failure";
		}
		result0.timeParse = parseHrtimeToSeconds(process.hrtime(queryTimeStart))
	} else {
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

    results.page = 1;

    if (1==1) {
		results.server0params = {
            // serverChoice0: "https://lemmy.world/",
            serverChoice0: "https://sh.itjust.works/",
		    serverAPI0: "api/v3/post/list?sort=New&" + results.community + "&limit=50&page=" + results.page,
		}

        //results.server0params.serverChoice0 = "https://feddit.de/";
		    //serverAPI0: "api/v3/post/list?sort=New&type_=Local&limit=40&page=1",
			// Today I learned, til 16791
		    //serverAPI0 = "api/v3/post/list?sort=New&community_id=16791&limit=50page=1"
		results.outServer0 = await getLemmyPosts(results.server0params, fetch);
	};

	if (1==1) {
		results.server1params = { serverChoice0: "https://lemmy.ml/",
		    serverAPI0: "api/v3/post/list?sort=New&" + results.community + "&limit=50&page=" + results.page,
		}
		results.outServer1 = await getLemmyPosts(results.server1params, fetch);
	};

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
    if (results.outServer0.failureCode != -1) {
        results.fetchErrors += 4;
    }
    if (results.outServer0.json.error) {
        results.fetchErrors += 8;
    }
    return results;
}


export async function checkPostsComments(results, fetch) {
    let posts0 = results.outServer0.json.posts;

    // for (let i = 0; i < posts0.length; i++) {
    for (let i = 0; i < 2; i++) {
        let newParams = {};
        newParams.serverChoice0 = results.server0params.serverChoice0;
        newParams.serverAPI0 = "api/v3/comment/list?post_id=" + posts0[i].post.id + "&limit=300&sort=New";
        console.log(newParams.serverAPI0);
        let postResults = await getLemmyPosts(newParams, fetch);
        console.log(postResults);
    }
}


// both posts arrays should be sorted by published timestamp
export function matchPosts(posts0, posts1) {
    let results = {
        resultsA: [],
        resultsB: [],   // exclude "same" matches, shorter list
        unfoundA: []
    };

    let onJ = -1;
    for (let i = 0; i < posts0.length; i++) {
        let foundMatch = false;
        // ToDo: start j value on onJ instead of 0?
        for (let j = 0; j < posts1.length; j++) {
            if (posts0[i].post.published == posts1[j].post.published) {
                // timestamps match, now title?
                if (posts0[i].post.name === posts1[j].post.name) {
                    results.resultsA.push(i + ":" + j + ":same");
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
