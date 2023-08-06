<script lang="ts">
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<h1>Welcome to Lemmy-Helper</h1>

<p>Lemmy-Helper provides a web interface to query your Lemmy database, below the Lemmy API.</p>

<!-- ToDo: add a 3rd param and pass a single object of JSON to server instead of individual params -->
<p>Output format: {data.output}, change: 
    <a href="?output=table&timeperiod={data.timeperiod}">table</a>,
    <a href="?output=json&timeperiod={data.timeperiod}">JSON</a>,
    <a href="?output=rows&timeperiod={data.timeperiod}">rows</a>
</p>

<p>Query time period: {data.timeperiod}, change: 
    <a href="?timeperiod=15&output={data.output}">15 minutes</a>,
    <a href="?timeperiod=30&output={data.output}">30 minutes</a>,
    <a href="?timeperiod=60&output={data.output}">60 minutes</a>,
    <a href="?timeperiod=180&output={data.output}">3 hours</a>,
    <a href="?timeperiod=720&output={data.output}">12 hours</a>
</p>

<ul>
    <li><a href="query/locks/?output={data.output}">locks</a> - PostgreSQL datatabase locks</li>
    <li><a href="query/pgcounts/?output={data.output}">pgcounts</a> - datatabase table record counts, also a good way to view the table names</li>
    <li>
        <a href="query/pg_indexes/?output={data.output}">pg_indexes</a> - datatabase INDEX list,
        <a href="query/pg_indexes1/?output={data.output}">pg_indexes1</a> -index columns
    </li>
    <li><a href="query/pg_triggers/?output={data.output}">pg_triggers</a> - datatabase TRIGGER list <a href="query/pg_triggers1/?output={data.output}">pg_triggers1</a></li>
    <li><a href="query/pgstatements/?output={data.output}">pgcstatements</a> - stats -
        <a href="query/pgstatements1/?output={data.output}">pgcstatements1</a> (all columns) -
       <a href="query/reset_pgstatements/?output=raw">RESET</a></li>
    <li><a href="query/pgrunning1/?output={data.output}">pgrunning1</a> database running</li>
    <li><a href="query/pgactivity/?output={data.output}">pgactivity</a> database pg_stat_activity</li>
    <li><a href="query/communitypending1/?output={data.output}">communitypending1</a> - Lemmy community join/subscribe pending. <a href="query/communitypending/">communitypending</a></li>
    <li><a href="query/posts/?output={data.output}">posts</a> - Lemmy POSTS, most recent hour</li>
    <li><a href="query/comments/?output={data.output}">comments</a> - Lemmy COMMENTS, most recent hour</li>
    <li><a href="query/localusers/?output={data.output}">localusers</a> - local instance users, most recent hour</li>
    <li><a href="query/activitylocal/?output={data.output}">activitylocal</a> - table, local, most recent hour</li>
    <li><a href="query/activityremote/?output={data.output}">activityremote</a> - table, remote, most recent hour</li>
    <li><a href="query/federatedpostcount/?output={data.output}">federatedpostcount</a></li>
    <li>
        <a href="query/federatedcommentcount/?output={data.output}">federatedcommentcount</a>,
        <a href="query/federatedcommentcount2/?output={data.output}">federatedcommentcount2</a>
    </li>
    <li><a href="query/posts_featured_community/?output={data.output}">posts_featured_community</a></li>
    <li><a href="query/posts_aggregates_featured_community/?output={data.output}">posts_aggregates_featured_community</a></li>
    <li><a href="query/posts_removed/?output={data.output}">posts_removed</a></li>
</ul>


raw tables: <a href="query/activity/?output=all">activity</a>,
     <a href="query/raw_comments/?output={data.output}">comments</a>,
     <a href="query/raw_posts/?output={data.output}">posts</a>,
     <a href="query/raw_post_like/?output={data.output}">post_like</a>,
     <a href="query/raw_post_aggregates/?output={data.output}">post_aggregates</a>,
     <a href="query/raw_person/?output={data.output}">person</a>,
     <a href="query/raw_comment_reply/?output={data.output}">coment_reply</a>,
     <a href="query/raw_comment_like/?output={data.output}">comment_like</a>,
     <a href="query/raw_comment_aggregates/?output={data.output}">comment_aggregates</a>,
     <a href="query/raw_community/?output={data.output}">community</a>,
     <a href="query/raw_instance/?output={data.output}">instance</a>,
     <a href="query/raw_mod_remove_post/?output={data.output}">mod_remove_post</a>,
     <a href="query/raw_mod_lock_post/?output={data.output}">mod_lock_post</a>,
     <a href="query/raw_mod_feature_post/?output={data.output}">mod_feature_post</a>,
     <a href="query/raw_site_aggregates/?output={data.output}">site_aggregates</a>,
     <a href="query/raw_site/?output={data.output}">site</a>,
     <a href="query/raw_local_site/?output={data.output}">local_site</a>,
     <a href="query/raw_community_aggregates/?output={data.output}">community_aggregates</a>,
     <a href="query/raw_person_aggregates/?output={data.output}">person_aggregates</a>,
<br />

explain: 
<a href="query/explain_posts/?output={data.output}">posts</a>
<br />

search:
<a href="query/search_posts3/?output={data.output}">posts3</a>,
<a href="query/search_person/?output={data.output}">person</a>,
<a href="query/search_comments/?output={data.output}">comments</a>
<br />

comments by Lemmy instance:
<a href="query/comments_ap_id_hostname0/?output={data.output}">comments_ap_id_hostname0</a>,
<a href="query/comments_ap_id_hostname1/?output={data.output}">comments_ap_id_hostname1</a>,
<a href="query/comments_ap_id_host_hour/?output={data.output}">comments_ap_id_host_hour</a>,
<a href="query/comments_ap_id_host_12hour/?output={data.output}">comments_ap_id_host_12hour</a>,
<a href="query/comments_ap_id_host_prev/?output={data.output}&timeperiod={data.timeperiod}">comments_ap_id_host_prev previous timeperiod</a>,
<br />


comment_like:
<a href="query/comment_like_person_prev/?output={data.output}&timeperiod={data.timeperiod}">comment_like_person_prev previous timeperiod</a>
<br />


posts by Lemmy instance:
<a href="query/posts_ap_id_host_prev/?output={data.output}&timeperiod={data.timeperiod}">posts_ap_id_host_prev previous timeperiod</a>
<br />

curious query:
<a href="query/curiousquery/?output={data.output}">curiousquery</a>,
<a href="query/curious_dualjoin1/?output={data.output}">dual join 1</a>,
<a href="query/curious_no_dualjoin1/?output={data.output}">without dual join 1</a>,
<a href="query/commentpath0/?output={data.output}">commentpath0 path="0"</a>,
<br />

Lemmy PostgreSql trigger/function study:
<a href="query/try_trigger_code0/?output={data.output}">try_trigger_code0 community_aggregates subquery</a>,
<a href="query/try_person_aggregates_update_count0/?output={data.output}">try_person_aggregates_update_count0</a>,
<a href="query/try_person_aggregates_update_score0/?output={data.output}">try_person_aggregates_update_score0</a>,
<a href="query/try_person_aggregates_update_count1/?output={data.output}">try_person_aggregates_update_count1</a>,
<a href="query/try_person_aggregates_update_score1/?output={data.output}">try_person_aggregates_update_score1</a>,

<br />

<hr />
<br />

Old stuff kept around for study/possible use
<br />


<ul>
    <li><a href="query/locks1/?output={data.output}">locks1</a> - datatabase locks complex,
        <a href="query/create_locks1_view/?output={data.output}">create locks1 view</a> - install view first
    </li>
    <li><a href="query/locks2/?output={data.output}">locks2</a> - datatabase locks complex 2,
        <a href="query/create_locks2_view/?output={data.output}">create locks2 view</a> - install view first
    </li>
    <li><a href="query/pgrunning/?output={data.output}">pgrunning</a></li>
</ul>