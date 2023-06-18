<script lang="ts">
    import { page } from '$app/stores';
 
    const url = $page.url;
 
    let output = url.searchParams.get('output');

    if (output==null) {
        output = "table";
    }
</script>

<h1>Welcome to Lemmy-Helper</h1>

<p>Lemmy-Helper provides a web interface to query your Lemmy database, below the Lemmy API.</p>

<p>Output format: {output}
    <a href="?output=table">table</a>,
    <a href="?output=json">JSON</a>,
    <a href="?output=rows">rows</a>
</p>

<ul>
    <li><a href="query/locks/?output={output}">locks</a> - datatabase locks</li>
    <li><a href="query/pgcounts/?output={output}">pgcounts</a> - datatabase table record counts</li>
    <li><a href="query/communitypending1/">communitypending1</a> - community join/subscribe pending. <a href="query/communitypending/">communitypending</a></li>
    <li><a href="query/posts/">posts</a> - content, POSTINGS, most recent hour</li>
    <li><a href="query/comments/">comments</a> - content, COMMENTS, most recent hour</li>
    <li><a href="query/localusers/">localusers</a> - local instance users, most recent hour</li>
    <li><a href="query/activitylocal/">activitylocal</a> - table, local, most recent hour</li>
    <li><a href="query/activityremote/">activityremote</a> - table, remote, most recent hour</li>
</ul>
