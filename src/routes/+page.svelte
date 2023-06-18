<script lang="ts">
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<h1>Welcome to Lemmy-Helper</h1>

<p>Lemmy-Helper provides a web interface to query your Lemmy database, below the Lemmy API.</p>

<p>Output format: {data.output}, change: 
    <a href="?output=table">table</a>,
    <a href="?output=json">JSON</a>,
    <a href="?output=rows">rows</a>
</p>

<ul>
    <li><a href="query/locks/?output={data.output}">locks</a> - datatabase locks</li>
    <li><a href="query/pgcounts/?output={data.output}">pgcounts</a> - datatabase table record counts</li>
    <li><a href="query/communitypending1/?output={data.output}">communitypending1</a> - community join/subscribe pending. <a href="query/communitypending/">communitypending</a></li>
    <li><a href="query/posts/?output={data.output}">posts</a> - content, POSTINGS, most recent hour</li>
    <li><a href="query/comments/?output={data.output}">comments</a> - content, COMMENTS, most recent hour</li>
    <li><a href="query/localusers/?output={data.output}">localusers</a> - local instance users, most recent hour</li>
    <li><a href="query/activitylocal/?output={data.output}">activitylocal</a> - table, local, most recent hour</li>
    <li><a href="query/activityremote/?output={data.output}">activityremote</a> - table, remote, most recent hour</li>
    <li><a href="query/federatedpostcount/?output={data.output}">federatedpostcount</a></li>
    <li><a href="query/federatedcommentcount/?output={data.output}">federatedcommentcount</a></li>
</ul>

raw: <a href="query/raw_comments/?output={data.output}">comments</a>,
     <a href="query/raw_posts/?output={data.output}">posts</a>
