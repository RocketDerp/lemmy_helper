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
    <li><a href="query/locks1/?output={data.output}">locks1</a> - datatabase locks complex,
        <a href="query/create_locks1_view/?output={data.output}">create locks1 view</a> - install view first
    </li>
    <li><a href="query/locks2/?output={data.output}">locks2</a> - datatabase locks complex 2,
        <a href="query/create_locks2_view/?output={data.output}">create locks2 view</a> - install view first
    </li>
    <li><a href="query/pgcounts/?output={data.output}">pgcounts</a> - datatabase table record counts</li>
    <li><a href="query/pg_indexes/?output={data.output}">pg_indexes</a> - datatabase INDEX list</li>
    <li><a href="query/pgstatements/?output={data.output}">pgcstatements</a> - stats -
        <a href="query/pgstatements1/?output={data.output}">pgcstatements1</a> (all columns) -
       <a href="query/reset_pgstatements/?output=raw">RESET</a></li>
    <li><a href="query/pgrunning/?output={data.output}">pgrunning</a></li>
    <li><a href="query/pgrunning1/?output={data.output}">pgrunning1</a></li>
    <li><a href="query/communitypending1/?output={data.output}">communitypending1</a> - community join/subscribe pending. <a href="query/communitypending/">communitypending</a></li>
    <li><a href="query/posts/?output={data.output}">posts</a> - content, POSTINGS, most recent hour</li>
    <li><a href="query/comments/?output={data.output}">comments</a> - content, COMMENTS, most recent hour</li>
    <li><a href="query/localusers/?output={data.output}">localusers</a> - local instance users, most recent hour</li>
    <li><a href="query/activitylocal/?output={data.output}">activitylocal</a> - table, local, most recent hour</li>
    <li><a href="query/activityremote/?output={data.output}">activityremote</a> - table, remote, most recent hour</li>
    <li><a href="query/federatedpostcount/?output={data.output}">federatedpostcount</a></li>
    <li>
        <a href="query/federatedcommentcount/?output={data.output}">federatedcommentcount</a>,
        <a href="query/federatedcommentcount2/?output={data.output}">federatedcommentcount2</a>
    </li>
</ul>

raw: <a href="query/activity/?output=all">activity</a>,
     <a href="query/raw_comments/?output={data.output}">comments</a>,
     <a href="query/raw_posts/?output={data.output}">posts</a>,
     <a href="query/raw_person/?output={data.output}">person</a>,
     <a href="query/raw_comment_reply/?output={data.output}">coment_reply</a>,
     <a href="query/raw_community/?output={data.output}">community</a>,
     <a href="query/raw_instance/?output={data.output}">instance</a>,
<br />

explain: 
<a href="query/explain_posts/?output={data.output}">posts</a>
<br />

search:
<a href="query/search_posts3/?output={data.output}">posts3</a>,
<a href="query/search_person/?output={data.output}">person</a>
<br />

curious query:
<a href="query/curiousquery/?output={data.output}">curiousquery</a>

