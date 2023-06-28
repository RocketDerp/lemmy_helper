export function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}


// Source code for this function form lemmy-ui-svelte
// Apache license
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


export async function lemmyLogin(params0, fetcha) {
	let result0 = { params0: params0,
        failureCode: -1,
        failureText: "",
        json: {}
        };
	let serverURL0 = params0.serverChoice0 + "api/v3/user/login";
	const startTime = process.hrtime();
    let resp = await fetch(serverURL0, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify( {
            username_or_email: params0.usernameOrEmail,
            password: params0.password
            } )
        });

	result0.timeConnect = parseHrtimeToSeconds(process.hrtime(startTime));
	if (resp.ok) {
		const queryTimeStart = process.hrtime();
		try {
			result0.json = await resp.json();
	    	// console.log(result0.json);
            if (result0.json.jwt) {
                result0.auth = parseJwt(result0.json.jwt);
            }
        } catch (e0) {
            console.error("JSON parse failed ", serverURL0);
			result0.failureCode = -1000;
			result0.failureText = "JSON parse failure";
		}
		result0.timeParse = parseHrtimeToSeconds(process.hrtime(queryTimeStart))
	} else {
        console.error("fetch failed ", serverURL0);
		result0.failureCode = resp.status;
		result0.failureText = resp.statusText;
	}

	return result0;
}


export async function lemmyCommentLike(params0, fetcha) {
	let result0 = { params0: params0,
        failureCode: -1,
        failureText: "",
        json: {}
        };
	let serverURL0 = params0.serverChoice0 + "api/v3/comment/like";
	const startTime = process.hrtime();
    let resp = await fetch(serverURL0, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify( {
            comment_id: params0.comment_id,
            score: 1,
            auth: params0.jwt
            } )
        });
	result0.timeConnect = parseHrtimeToSeconds(process.hrtime(startTime));
	if (resp.ok) {
		const queryTimeStart = process.hrtime();
		try {
			result0.json = await resp.json();
	    	// console.log(result0.json);
        } catch (e0) {
            console.error("JSON parse failed ", serverURL0);
			result0.failureCode = -1000;
			result0.failureText = "JSON parse failure";
		}
		result0.timeParse = parseHrtimeToSeconds(process.hrtime(queryTimeStart))
	} else {
        console.error("fetch failed ", serverURL0);
		result0.failureCode = resp.status;
		result0.failureText = resp.statusText;
	}

	return result0;
}
