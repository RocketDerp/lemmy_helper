import type { PageServerLoad } from './$types'
import { Client } from 'pg'

/*
ToDo: Whitespace in this file is a mess, this code looks messy. But it's safe to run.
*/
export const load: PageServerLoad = async (incoming) => {

	let sqlQuery;
	let sqlParams = [];
	let outRows = {};
	let outRowsRaw = [];
	let output = "all";
	let timeperiod = 720;
	let timeperiodmessage = "";
	let sqlObjectBreak = false;

	// This is experimental quick/dirty code, so some the workings are exposed ;)
	console.log("--------- url")
	console.log(incoming.url)

	// Optonal parameter
	// The HTML side of the page gets passed the output parameter, it isn't going into the SQL statements.
	if (incoming.url.searchParams.get("output")) {
		output = incoming.url.searchParams.get("output");
	}
	if (incoming.url.searchParams.get("timeperiod")) {
		// for safety, ONLY intger values
		timeperiod = parseInt(incoming.url.searchParams.get("timeperiod"));
	}

	// this switch statement guards the parameter, only whitelist matching.
	// ToDo: be more consistent about "pg_" prefix, but will break saved URLs
	switch (incoming.params.name) {
		case "test1":
			sqlQuery = 'SELECT $1::text AS message';
			sqlParams = ['Hello world!'];
			break;
		case "locks":
			sqlQuery = "SELECT * FROM pg_locks;";
			break;
		case "create_locks1_view":
			// ToDo: for the record, I don't know these queries actually work. Testing seems to generate nothing.
			// discussion: https://stackoverflow.com/questions/26489244/how-to-detect-query-which-holds-the-lock-in-postgres
			sqlQuery = `
			CREATE VIEW lock_monitor AS (
				SELECT
				COALESCE(blockingl.relation::regclass::text,blockingl.locktype) as locked_item,
				now() - blockeda.query_start AS waiting_duration, blockeda.pid AS blocked_pid,
				blockeda.query as blocked_query, blockedl.mode as blocked_mode,
				blockinga.pid AS blocking_pid, blockinga.query as blocking_query,
				blockingl.mode as blocking_mode
				FROM pg_catalog.pg_locks blockedl
				JOIN pg_stat_activity blockeda ON blockedl.pid = blockeda.pid
				JOIN pg_catalog.pg_locks blockingl ON (
					( (blockingl.transactionid=blockedl.transactionid) OR
					(blockingl.relation=blockedl.relation AND blockingl.locktype=blockedl.locktype)
				) AND blockedl.pid != blockingl.pid)
				JOIN pg_stat_activity blockinga ON blockingl.pid = blockinga.pid
				AND blockinga.datid = blockeda.datid
				WHERE NOT blockedl.granted
				AND blockinga.datname = current_database()
			)
			;`
			break;
		case "create_locks2_view":
			// ToDo: for the record, I don't know these queries actually work. Testing seems to generate nothing.
			// remove all where causes in the name of getting some actual output on every page refresh
			sqlQuery = `
			CREATE VIEW lock_monitor2 AS (
				SELECT
				COALESCE(blockingl.relation::regclass::text,blockingl.locktype) as locked_item,
				now() - blockeda.query_start AS waiting_duration, blockeda.pid AS blocked_pid,
				blockeda.query as blocked_query, blockedl.mode as blocked_mode,
				blockinga.pid AS blocking_pid, blockinga.query as blocking_query,
				blockingl.mode as blocking_mode
				FROM pg_catalog.pg_locks blockedl
				JOIN pg_stat_activity blockeda ON blockedl.pid = blockeda.pid
				JOIN pg_catalog.pg_locks blockingl ON (
					( (blockingl.transactionid=blockedl.transactionid) OR
					(blockingl.relation=blockedl.relation AND blockingl.locktype=blockedl.locktype)
				) AND blockedl.pid != blockingl.pid)
				JOIN pg_stat_activity blockinga ON blockingl.pid = blockinga.pid
				AND blockinga.datid = blockeda.datid
			)
			;`
			break;
		case "locks1":
			// NOTE: requires the view to be created on server
			sqlQuery = `SELECT * from lock_monitor;`
			break;
		case "locks2":
			// NOTE: requires the view to be created on server
			sqlQuery = `SELECT * from lock_monitor2;`
			sqlObjectBreak = true;
			break;
		case 'pgrunning':
			sqlQuery = `SELECT pid, age(clock_timestamp(), query_start), usename, query 
			FROM pg_stat_activity 
			WHERE query != '<IDLE>' AND query NOT ILIKE '%pg_stat_activity%' 
			ORDER BY query_start desc
			;`
			break;
		case "pg_drop_index0":
			sqlQuery = `
			DROP INDEX idx_post_aggregates_community
			;`
			break;
		case "pg_drop_index1":
			sqlQuery = `
			DROP INDEX idx_post_aggregates_creator
			;`
			break;
		case "pg_create_index0":
			sqlQuery = `
			CREATE INDEX
			idx_post_aggregates_community
			ON post_aggregates (community_id DESC)
			;`
			break;
		case "pg_create_index1":
			sqlQuery = `
			CREATE INDEX
			idx_post_aggregates_creator
			ON post_aggregates (creator_id DESC)
			;`
			break;
		case 'pg_indexes':
			sqlQuery = `
			SELECT *
			FROM pg_indexes
			WHERE tablename NOT LIKE 'pg%'
			ORDER BY tablename, indexname
			;`
			break;
		case 'pg_indexes1':
			// https://stackoverflow.com/questions/2204058/list-columns-with-indexes-in-postgresql
			sqlQuery = `
			select
			t.relname as table_name,
			i.relname as index_name,
			array_to_string(array_agg(a.attname), ', ') as column_names
		from
			pg_class t,
			pg_class i,
			pg_index ix,
			pg_attribute a
		where
			t.oid = ix.indrelid
			and i.oid = ix.indexrelid
			and a.attrelid = t.oid
			and a.attnum = ANY(ix.indkey)
			and t.relkind = 'r'
		group by
			t.relname,
			i.relname
		order by
			t.relname,
			i.relname;
			;`
			break;		
		case 'pg_triggers':
			sqlQuery = `
			SELECT event_object_table AS table_name, trigger_name         
			FROM information_schema.triggers  
			GROUP BY table_name, trigger_name 
			ORDER BY table_name, trigger_name 
			;`
			break;
		case 'pg_triggers1':
			sqlQuery = `
			SELECT event_object_table AS table_name, trigger_name         
			FROM information_schema.triggers  
			ORDER BY table_name, trigger_name 
			;`
			break;
		case 'install_pgstatements':
			// PostgreSQL extension pg_stat_statements for performance troubleshooting.
			// https://www.timescale.com/blog/identify-postgresql-performance-bottlenecks-with-pg_stat_statements/
			// install extension:
			//  https://pganalyze.com/docs/install/self_managed/02_enable_pg_stat_statements_deb
			//  sudo -iu postgres psql -c "ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';"
			sqlQuery = `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;`;
			break;
		case 'pgstatements':
			sqlQuery = `
			SELECT queryid, calls, rows, mean_exec_time, query
		    FROM pg_stat_statements
			ORDER BY calls DESC
			;`
			break;
		case 'reset_pgstatements':
			sqlQuery = `SELECT pg_stat_statements_reset();`
			break;			
		case 'pgstatements1':
			sqlQuery = `
			SELECT queryid, calls, rows, mean_exec_time, query, *
			FROM pg_stat_statements
			ORDER BY calls DESC
			;`
			break;
		case 'pgactivity':
			// 			WHERE backend_type = 'client backend'
			sqlQuery = `
			SELECT usename, query, wait_event, wait_event_type, query_start, state, state_change, to_char(age(clock_timestamp(), query_start), 'HH24:MI:SS FF6') AS elapsed
			FROM pg_stat_activity
			WHERE usename = 'lemmy'
			   OR usename = 'lemmy_read0'
			ORDER BY state, query_start
			;`
			break;
		case 'pgactivity1':
			// adding state to SELECT seems to impact behavior of what gets loaded, wierd
			sqlQuery = `
			SELECT usename, query, wait_event, wait_event_type, query_start, state_change, to_char(age(clock_timestamp(), query_start), 'HH24:MI:SS FF6') AS elapsed
			FROM pg_stat_activity
			WHERE usename = 'lemmy'
				OR usename = 'lemmy_read0'
			ORDER BY query_start
			;`
			break;
		case 'sleeptest0':
			sqlQuery = `
			SELECT pg_sleep(2),
			    id, name, creator_id, community_id, published, updated,
				ap_id, local, *
			FROM public.post
			ORDER BY id DESC
			LIMIT 1
			;`
			break;
		case 'sleeptest1':
			// run lemmy_helper app with different PostgreSQL login to see if triggers statement timeout.
			sqlQuery = `
			SELECT pg_sleep(12),
			    id, name, creator_id, community_id, published, updated,
				ap_id, local, *
			FROM public.post
			ORDER BY id DESC
			LIMIT 1
			;`
			break;
		case 'sleeptest2':
			// run lemmy_helper app with different PostgreSQL login to see if triggers statement timeout.
			sqlQuery = `
			SELECT pg_sleep(45),
			    id, name, creator_id, community_id, published, updated,
				ap_id, local, *
			FROM public.post
			ORDER BY id DESC
			LIMIT 1
			;`
			break;
		case 'killall_user0':
// restrict this
// break;
			sqlQuery = `
			SELECT pg_cancel_backend(pid)
			 FROM pg_stat_activity
			WHERE state = 'active'
			AND usename = 'lemmy_read0'
			AND pid <> pg_backend_pid();
			;`
			break;
		case 'killall_user1':
// restrict this
// break;
			sqlQuery = `
			SELECT pg_terminate_backend(pid)
				FROM pg_stat_activity
			WHERE state = 'active'
			AND usename = 'lemmy_read0'
			AND pid <> pg_backend_pid();
			;`
		case 'explain_posts':
			// ToDo: I tried EXPLAIN here, but it didn't work, or maybe JSON won't output it?
			sqlQuery = `EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON)
			 SELECT post.id, post.name, post.url, post.body, post.creator_id, post.community_id, post.removed, post.locked, post.published, post.updated, post.deleted, post.nsfw, post.embed_title, post.embed_description, post.embed_video_url, post.thumbnail_url, post.ap_id, post.local, post.language_id, post.featured_community, post.featured_local,
			  person.id, person.name, person.display_name, person.avatar, person.banned, person.published, person.updated, person.actor_id, person.bio, person.local, person.banner, person.deleted, person.inbox_url, person.shared_inbox_url, person.matrix_user_id, person.admin, person.bot_account, person.ban_expires, person.instance_id,
			  community.id, community.name, community.title, community.description, community.removed, community.published, community.updated, community.deleted, community.nsfw, community.actor_id, community.local, community.icon, community.banner, community.hidden, community.posting_restricted_to_mods, community.instance_id, community_person_ban.id, community_person_ban.community_id, community_person_ban.person_id, community_person_ban.published, community_person_ban.expires,
			  post_aggregates.id, post_aggregates.post_id, post_aggregates.comments, post_aggregates.score, post_aggregates.upvotes, post_aggregates.downvotes, post_aggregates.published, post_aggregates.newest_comment_time_necro, post_aggregates.newest_comment_time, post_aggregates.featured_community, post_aggregates.featured_local,
			  community_follower.id, community_follower.community_id, community_follower.person_id, community_follower.published, community_follower.pending,
			  post_saved.id, post_saved.post_id, post_saved.person_id, post_saved.published,
			  post_read.id, post_read.post_id, post_read.person_id, post_read.published,
			  person_block.id, person_block.person_id, person_block.target_id, person_block.published,
			  post_like.score, coalesce((post_aggregates.comments - person_post_aggregates.read_comments), post_aggregates.comments)
			  FROM ((((((((((((post INNER JOIN person ON (post.creator_id = person.id)) 
			    INNER JOIN community ON (post.community_id = community.id))
			    LEFT OUTER JOIN community_person_ban ON (((post.community_id = community_person_ban.community_id) AND (community_person_ban.person_id = post.creator_id)) AND ((community_person_ban.expires IS NULL) OR (community_person_ban.expires > CURRENT_TIMESTAMP))))
				INNER JOIN post_aggregates ON (post_aggregates.post_id = post.id))
				LEFT OUTER JOIN community_follower ON ((post.community_id = community_follower.community_id) AND (community_follower.person_id = '33517')))
				LEFT OUTER JOIN post_saved ON ((post.id = post_saved.post_id) AND (post_saved.person_id = '33517')))
				LEFT OUTER JOIN post_read ON ((post.id = post_read.post_id) AND (post_read.person_id = '33517')))
				LEFT OUTER JOIN person_block ON ((post.creator_id = person_block.target_id) AND (person_block.person_id = '33517')))
				LEFT OUTER JOIN community_block ON ((community.id = community_block.community_id) AND (community_block.person_id = '33517')))
				LEFT OUTER JOIN post_like ON ((post.id = post_like.post_id) AND (post_like.person_id = '33517')))
				LEFT OUTER JOIN person_post_aggregates ON ((post.id = person_post_aggregates.post_id) AND (person_post_aggregates.person_id = '33517')))
				LEFT OUTER JOIN local_user_language ON ((post.language_id = local_user_language.language_id) AND (local_user_language.local_user_id = '11402')))
				 WHERE ((((((((((community_follower.person_id IS NOT NULL) AND (post.nsfw = 'f')) AND (community.nsfw = 'f')) AND (local_user_language.language_id IS NOT NULL)) AND (community_block.person_id IS NULL)) AND (person_block.person_id IS NULL)) AND (post.removed = 'f')) AND (post.deleted = 'f')) AND (community.removed = 'f')) AND (community.deleted = 'f'))
				 ORDER BY post_aggregates.featured_local DESC , post_aggregates.hot_rank DESC
				 LIMIT '40' OFFSET '0'
			;`
			break;
		case 'search_posts':
			sqlQuery = `
				SELECT post.id, post.name, post.url, post.body, post.creator_id, post.community_id, post.removed, post.locked, post.published, post.updated, post.deleted, post.nsfw, post.embed_title, post.embed_description, post.embed_video_url, post.thumbnail_url, post.ap_id, post.local, post.language_id, post.featured_community, post.featured_local,
				person.id, person.name, person.display_name, person.avatar, person.banned, person.published, person.updated, person.actor_id, person.bio, person.local, person.banner, person.deleted, person.inbox_url, person.shared_inbox_url, person.matrix_user_id, person.admin, person.bot_account, person.ban_expires, person.instance_id,
				community.id, community.name, community.title, community.description, community.removed, community.published, community.updated, community.deleted, community.nsfw, community.actor_id, community.local, community.icon, community.banner, community.hidden, community.posting_restricted_to_mods, community.instance_id, community_person_ban.id, community_person_ban.community_id, community_person_ban.person_id, community_person_ban.published, community_person_ban.expires,
				post_aggregates.id, post_aggregates.post_id, post_aggregates.comments, post_aggregates.score, post_aggregates.upvotes, post_aggregates.downvotes, post_aggregates.published, post_aggregates.newest_comment_time_necro, post_aggregates.newest_comment_time, post_aggregates.featured_community, post_aggregates.featured_local,
				community_follower.id, community_follower.community_id, community_follower.person_id, community_follower.published, community_follower.pending,
				post_saved.id, post_saved.post_id, post_saved.person_id, post_saved.published,
				post_read.id, post_read.post_id, post_read.person_id, post_read.published,
				person_block.id, person_block.person_id, person_block.target_id, person_block.published,
				post_like.score, coalesce((post_aggregates.comments - person_post_aggregates.read_comments), post_aggregates.comments)
				FROM ((((((((((((post INNER JOIN person ON (post.creator_id = person.id)) 
				INNER JOIN community ON (post.community_id = community.id))
				LEFT OUTER JOIN community_person_ban ON (((post.community_id = community_person_ban.community_id) AND (community_person_ban.person_id = post.creator_id)) AND ((community_person_ban.expires IS NULL) OR (community_person_ban.expires > CURRENT_TIMESTAMP))))
				INNER JOIN post_aggregates ON (post_aggregates.post_id = post.id))
				LEFT OUTER JOIN community_follower ON ((post.community_id = community_follower.community_id) AND (community_follower.person_id = '33517')))
				LEFT OUTER JOIN post_saved ON ((post.id = post_saved.post_id) AND (post_saved.person_id = '33517')))
				LEFT OUTER JOIN post_read ON ((post.id = post_read.post_id) AND (post_read.person_id = '33517')))
				LEFT OUTER JOIN person_block ON ((post.creator_id = person_block.target_id) AND (person_block.person_id = '33517')))
				LEFT OUTER JOIN community_block ON ((community.id = community_block.community_id) AND (community_block.person_id = '33517')))
				LEFT OUTER JOIN post_like ON ((post.id = post_like.post_id) AND (post_like.person_id = '33517')))
				LEFT OUTER JOIN person_post_aggregates ON ((post.id = person_post_aggregates.post_id) AND (person_post_aggregates.person_id = '33517')))
				LEFT OUTER JOIN local_user_language ON ((post.language_id = local_user_language.language_id) AND (local_user_language.local_user_id = '11402')))
					WHERE ((((((((((community_follower.person_id IS NOT NULL) AND (post.nsfw = 'f')) AND (community.nsfw = 'f')) AND (local_user_language.language_id IS NOT NULL)) AND (community_block.person_id IS NULL)) AND (person_block.person_id IS NULL)) AND (post.removed = 'f')) AND (post.deleted = 'f')) AND (community.removed = 'f')) AND (community.deleted = 'f'))
					ORDER BY post_aggregates.featured_local DESC , post_aggregates.hot_rank DESC
					LIMIT '40' OFFSET '0'
			;`
			break;
		case 'search_posts1':
			sqlQuery = `
				SELECT post.id, post.name, post.url, post.body, post.creator_id, post.community_id, post.removed, post.locked, post.published, post.updated, post.deleted, post.nsfw, post.embed_title, post.embed_description, post.embed_video_url, post.thumbnail_url, post.ap_id, post.local, post.language_id, post.featured_community, post.featured_local,
				person.id, person.name, person.display_name, person.avatar, person.banned, person.published, person.updated, person.actor_id, person.bio, person.local, person.banner, person.deleted, person.inbox_url, person.shared_inbox_url, person.matrix_user_id, person.admin, person.bot_account, person.ban_expires, person.instance_id,
				community.id, community.name, community.title, community.description, community.removed, community.published, community.updated, community.deleted, community.nsfw, community.actor_id, community.local, community.icon, community.banner, community.hidden, community.posting_restricted_to_mods, community.instance_id, community_person_ban.id, community_person_ban.community_id, community_person_ban.person_id, community_person_ban.published, community_person_ban.expires,
				post_aggregates.id, post_aggregates.post_id, post_aggregates.comments, post_aggregates.score, post_aggregates.upvotes, post_aggregates.downvotes, post_aggregates.published, post_aggregates.newest_comment_time_necro, post_aggregates.newest_comment_time, post_aggregates.featured_community, post_aggregates.featured_local,
				community_follower.id, community_follower.community_id, community_follower.person_id, community_follower.published, community_follower.pending,
				post_saved.id, post_saved.post_id, post_saved.person_id, post_saved.published,
				post_read.id, post_read.post_id, post_read.person_id, post_read.published,
				person_block.id, person_block.person_id, person_block.target_id, person_block.published,
				post_like.score, coalesce((post_aggregates.comments - person_post_aggregates.read_comments), post_aggregates.comments)
				FROM ((((((((((((post INNER JOIN person ON (post.creator_id = person.id)) 
				INNER JOIN community ON (post.community_id = community.id))
				LEFT OUTER JOIN community_person_ban ON (((post.community_id = community_person_ban.community_id) AND (community_person_ban.person_id = post.creator_id)) AND ((community_person_ban.expires IS NULL) OR (community_person_ban.expires > CURRENT_TIMESTAMP))))
				INNER JOIN post_aggregates ON (post_aggregates.post_id = post.id))
				LEFT OUTER JOIN community_follower ON ((post.community_id = community_follower.community_id) ))
				LEFT OUTER JOIN post_saved ON ((post.id = post_saved.post_id) ))
				LEFT OUTER JOIN post_read ON ((post.id = post_read.post_id) ))
				LEFT OUTER JOIN person_block ON ((post.creator_id = person_block.target_id) ))
				LEFT OUTER JOIN community_block ON ((community.id = community_block.community_id) ))
				LEFT OUTER JOIN post_like ON ((post.id = post_like.post_id)  ))
				LEFT OUTER JOIN person_post_aggregates ON ((post.id = person_post_aggregates.post_id) ))
				LEFT OUTER JOIN local_user_language ON ((post.language_id = local_user_language.language_id) ))
					WHERE ((((((((((community_follower.person_id IS NOT NULL) AND (post.nsfw = 'f')) AND (community.nsfw = 'f')) AND (local_user_language.language_id IS NOT NULL)) AND (community_block.person_id IS NULL)) AND (person_block.person_id IS NULL)) AND (post.removed = 'f')) AND (post.deleted = 'f')) AND (community.removed = 'f')) AND (community.deleted = 'f'))
					ORDER BY post_aggregates.featured_local DESC , post_aggregates.hot_rank DESC
					LIMIT '40' OFFSET '0'
			;`
			break;
		case 'search_posts2':
			sqlQuery = `
SELECT "post"."id", "post"."name", "post"."url", "post"."body", "post"."creator_id", "post"."community_id", "post"."removed", "post"."locked", "post"."published", "post"."updated", "post"."deleted", "post"."nsfw", "post"."embed_title", "post"."embed_description", "post"."embed_video_url", "post"."thumbnail_url", "post"."ap_id", "post"."local", "post"."language_id", "post"."featured_community", "post"."featured_local",
 "person"."id", "person"."name", "person"."display_name", "person"."avatar", "person"."banned", "person"."published", "person"."updated", "person"."actor_id", "person"."bio", "person"."local", "person"."banner", "person"."deleted", "person"."inbox_url", "person"."shared_inbox_url", "person"."matrix_user_id", "person"."admin", "person"."bot_account", "person"."ban_expires", "person"."instance_id",
 "community"."id", "community"."name", "community"."title", "community"."description", "community"."removed", "community"."published", "community"."updated", "community"."deleted", "community"."nsfw", "community"."actor_id", "community"."local", "community"."icon", "community"."banner", "community"."hidden", "community"."posting_restricted_to_mods", "community"."instance_id",
 "community_person_ban"."id", "community_person_ban"."community_id", "community_person_ban"."person_id", "community_person_ban"."published", "community_person_ban"."expires",
 "post_aggregates"."id", "post_aggregates"."post_id", "post_aggregates"."comments", "post_aggregates"."score", "post_aggregates"."upvotes", "post_aggregates"."downvotes", "post_aggregates"."published", "post_aggregates"."newest_comment_time_necro", "post_aggregates"."newest_comment_time", "post_aggregates"."featured_community", "post_aggregates"."featured_local", "post_aggregates"."hot_rank", "post_aggregates"."hot_rank_active",
 "community_follower"."id", "community_follower"."community_id", "community_follower"."person_id", "community_follower"."published", "community_follower"."pending",
 "post_saved"."id", "post_saved"."post_id", "post_saved"."person_id", "post_saved"."published", "post_read"."id", "post_read"."post_id", "post_read"."person_id", "post_read"."published",
 "person_block"."id", "person_block"."person_id", "person_block"."target_id", "person_block"."published",
 "post_like"."score",
 coalesce(("post_aggregates"."comments" - "person_post_aggregates"."read_comments"), "post_aggregates"."comments")
 FROM (((((((((((("post" INNER JOIN "person" ON ("post"."creator_id" = "person"."id")) INNER JOIN "community" ON ("post"."community_id" = "community"."id"))
   LEFT OUTER JOIN "community_person_ban" ON ((("post"."community_id" = "community_person_ban"."community_id") AND ("community_person_ban"."person_id" = "post"."creator_id")) AND (("community_person_ban"."expires" IS NULL) OR ("community_person_ban"."expires" > CURRENT_TIMESTAMP))))
   INNER JOIN "post_aggregates" ON ("post_aggregates"."post_id" = "post"."id"))
   LEFT OUTER JOIN "community_follower" ON (("post"."community_id" = "community_follower"."community_id") AND ("community_follower"."person_id" = $1)))
   LEFT OUTER JOIN "post_saved" ON (("post"."id" = "post_saved"."post_id") AND ("post_saved"."person_id" = $2)))
   LEFT OUTER JOIN "post_read" ON (("post"."id" = "post_read"."post_id") AND ("post_read"."person_id" = $3)))
   LEFT OUTER JOIN "person_block" ON (("post"."creator_id" = "person_block"."target_id") AND ("person_block"."person_id" = $4)))
   LEFT OUTER JOIN "community_block" ON (("community"."id" = "community_block"."community_id") AND ("community_block"."person_id" = $5)))
   LEFT OUTER JOIN "post_like" ON (("post"."id" = "post_like"."post_id") AND ("post_like"."person_id" = $6)))
   LEFT OUTER JOIN "person_post_aggregates" ON (("post"."id" = "person_post_aggregates"."post_id") AND ("person_post_aggregates"."person_id" = $7)))
   LEFT OUTER JOIN "local_user_language" ON (("post"."language_id" = "local_user_language"."language_id") AND ("local_user_language"."local_user_id" = $8)))
   WHERE ((((((("post"."creator_id" = $9) AND ("post"."nsfw" = $10)) AND ("community"."nsfw" = $11)) AND ("post"."removed" = $12)) AND ("post"."deleted" = $13)) AND ("community"."removed" = $14)) AND ("community"."deleted" = $15))
   ORDER BY "post_aggregates"."featured_local" DESC , "post_aggregates"."published" DESC LIMIT 40
   OFFSET 0
			;`
			sqlParams = [
				// first 7 are person_id
				2, 2, 2, 2, 2, 2, 2,
				// 8 is only posts from a certain creator, this isn't the query we want
			]
			break;
		case 'search_posts3':
			// this is a query of a specific community, newst postings
			// /c/lemmyworld@lemmy.world/data_type/Post/sort/New/page/1
			sqlQuery = `
SELECT "post"."id" AS post_id_0, "post"."name" AS post_name_0,
   "post"."url" AS post_url_0, "post"."body", "post"."creator_id", "post"."community_id", "post"."removed", "post"."locked", "post"."published" AS post_published_0, "post"."updated", "post"."deleted", "post"."nsfw",
   "post"."embed_title", "post"."embed_description", "post"."embed_video_url", "post"."thumbnail_url", "post"."ap_id", "post"."local", "post"."language_id", "post"."featured_community", "post"."featured_local",
 "person"."id", "person"."name", "person"."display_name", "person"."avatar", "person"."banned", "person"."published", "person"."updated", "person"."actor_id", "person"."bio", "person"."local", "person"."banner", "person"."deleted", "person"."inbox_url", "person"."shared_inbox_url", "person"."matrix_user_id", "person"."admin", "person"."bot_account", "person"."ban_expires", "person"."instance_id",
 "community"."id", "community"."name" AS community_name_0, "community"."title" AS community_title_0, "community"."description", "community"."removed", "community"."published", "community"."updated", "community"."deleted", "community"."nsfw", "community"."actor_id", "community"."local", "community"."icon", "community"."banner", "community"."hidden", "community"."posting_restricted_to_mods", "community"."instance_id",
 "community_person_ban"."id", "community_person_ban"."community_id", "community_person_ban"."person_id", "community_person_ban"."published", "community_person_ban"."expires",
 "post_aggregates"."id", "post_aggregates"."post_id", "post_aggregates"."comments", "post_aggregates"."score", "post_aggregates"."upvotes", "post_aggregates"."downvotes", "post_aggregates"."published", "post_aggregates"."newest_comment_time_necro", "post_aggregates"."newest_comment_time", "post_aggregates"."featured_community", "post_aggregates"."featured_local", "post_aggregates"."hot_rank", "post_aggregates"."hot_rank_active",
 "community_follower"."id", "community_follower"."community_id", "community_follower"."person_id", "community_follower"."published", "community_follower"."pending",
 "post_saved"."id", "post_saved"."post_id", "post_saved"."person_id", "post_saved"."published",
 "post_read"."id", "post_read"."post_id", "post_read"."person_id", "post_read"."published",
 "person_block"."id", "person_block"."person_id", "person_block"."target_id", "person_block"."published", "post_like"."score",
 coalesce(("post_aggregates"."comments" - "person_post_aggregates"."read_comments"), "post_aggregates"."comments")
 FROM (((((((((((("post"
 INNER JOIN "person" ON ("post"."creator_id" = "person"."id"))
 INNER JOIN "community" ON ("post"."community_id" = "community"."id"))
 LEFT OUTER JOIN "community_person_ban" ON ((("post"."community_id" = "community_person_ban"."community_id") AND ("community_person_ban"."person_id" = "post"."creator_id")) AND (("community_person_ban"."expires" IS NULL) OR ("community_person_ban"."expires" > CURRENT_TIMESTAMP))))
 INNER JOIN "post_aggregates" ON ("post_aggregates"."post_id" = "post"."id"))
 LEFT OUTER JOIN "community_follower" ON (("post"."community_id" = "community_follower"."community_id") AND ("community_follower"."person_id" = $1)))
 LEFT OUTER JOIN "post_saved" ON (("post"."id" = "post_saved"."post_id") AND ("post_saved"."person_id" = $2)))
 LEFT OUTER JOIN "post_read" ON (("post"."id" = "post_read"."post_id") AND ("post_read"."person_id" = $3)))
 LEFT OUTER JOIN "person_block" ON (("post"."creator_id" = "person_block"."target_id") AND ("person_block"."person_id" = $4)))
 LEFT OUTER JOIN "community_block" ON (("community"."id" = "community_block"."community_id") AND ("community_block"."person_id" = $5)))
 LEFT OUTER JOIN "post_like" ON (("post"."id" = "post_like"."post_id") AND ("post_like"."person_id" = $6)))
 LEFT OUTER JOIN "person_post_aggregates" ON (("post"."id" = "person_post_aggregates"."post_id") AND ("person_post_aggregates"."person_id" = $7)))
 LEFT OUTER JOIN "local_user_language" ON (("post"."language_id" = "local_user_language"."language_id") AND ("local_user_language"."local_user_id" = $8)))
 WHERE (((((((((("community"."hidden" = $9) OR ("community_follower"."person_id" = $10)) AND ("post"."community_id" = $11)) AND ("local_user_language"."language_id" IS NOT NULL)) AND ("community_block"."person_id" IS NULL)) AND ("person_block"."person_id" IS NULL)) AND ("post"."removed" = $12)) AND ("post"."deleted" = $13)) AND ("community"."removed" = $14)) AND ("community"."deleted" = $15))
 ORDER BY "post_aggregates"."featured_community" DESC , "post_aggregates"."published" DESC
 LIMIT $16
 OFFSET $17
 			;`
			sqlParams = [
				// first 7 are person_id
				2, 2, 2, 2, 2, 2, 2,
				// 8 is local_user_id for language
				2,
				false, 2,
				// 11 is the community_id, the listing was for a single community postings
				30, // lemmyworld
				// 12 is removed, 13 is deleted, 14 removed, 15 deleted
				false, false, false, false,
				// 16 limit, 17 offset
				40, 0
			]
			break;
		case 'search_person':
			// stats identified this as a slow query tht is running thousands of time with incomding Federation activity.
			// https://github.com/LemmyNet/lemmy/issues/3061
			sqlQuery = `
			SELECT "person"."id", "person"."name", "person"."display_name", "person"."avatar", "person"."banned", "person"."published", "person"."updated", "person"."actor_id", "person"."bio", "person"."local", "person"."banner", "person"."deleted", "person"."inbox_url", "person"."shared_inbox_url", "person"."matrix_user_id", "person"."admin", "person"."bot_account", "person"."ban_expires", "person"."instance_id",
			 "person_aggregates"."id", "person_aggregates"."person_id", "person_aggregates"."post_count", "person_aggregates"."post_score", "person_aggregates"."comment_count", "person_aggregates"."comment_score"
			  FROM ("person" INNER JOIN "person_aggregates" ON ("person_aggregates"."person_id" = "person"."id"))
			  WHERE (("person"."admin" = $1) AND ("person"."deleted" = $2)) ORDER BY "person"."published"
			;`
			sqlParams = [
				true, false
			]
			break;
		case 'search_comments':
			// lemmy-ui "local", "comments", "active" picked at top of home page
			// NOTE: removed "person"."private_key" and "community"."private_key" from SELECT
			sqlQuery = `SELECT "comment"."id", "comment"."creator_id", "comment"."post_id", "comment"."content", "comment"."removed", "comment"."published", "comment"."updated", "comment"."deleted", "comment"."ap_id", "comment"."local", "comment"."path", "comment"."distinguished", "comment"."language_id",
			 "person"."id", "person"."name", "person"."display_name", "person"."avatar", "person"."banned", "person"."published", "person"."updated", "person"."actor_id", "person"."bio", "person"."local", "person"."public_key", "person"."last_refreshed_at", "person"."banner", "person"."deleted", "person"."inbox_url", "person"."shared_inbox_url", "person"."matrix_user_id", "person"."admin", "person"."bot_account", "person"."ban_expires", "person"."instance_id",
			 "post"."id", "post"."name", "post"."url", "post"."body", "post"."creator_id", "post"."community_id", "post"."removed", "post"."locked", "post"."published", "post"."updated", "post"."deleted", "post"."nsfw", "post"."embed_title", "post"."embed_description", "post"."thumbnail_url", "post"."ap_id", "post"."local", "post"."embed_video_url", "post"."language_id", "post"."featured_community", "post"."featured_local",
			 "community"."id", "community"."name", "community"."title", "community"."description", "community"."removed", "community"."published", "community"."updated", "community"."deleted", "community"."nsfw", "community"."actor_id", "community"."local", "community"."public_key", "community"."last_refreshed_at", "community"."icon", "community"."banner", "community"."followers_url", "community"."inbox_url", "community"."shared_inbox_url", "community"."hidden", "community"."posting_restricted_to_mods", "community"."instance_id", "community"."moderators_url", "community"."featured_url", "comment_aggregates"."id", "comment_aggregates"."comment_id",
			 "comment_aggregates"."score", "comment_aggregates"."upvotes", "comment_aggregates"."downvotes", "comment_aggregates"."published", "comment_aggregates"."child_count", "comment_aggregates"."hot_rank",
			 "community_person_ban"."id", "community_person_ban"."community_id", "community_person_ban"."person_id", "community_person_ban"."published", "community_person_ban"."expires",
			 "community_follower"."id", "community_follower"."community_id", "community_follower"."person_id", "community_follower"."published", "community_follower"."pending",
			 "comment_saved"."id", "comment_saved"."comment_id", "comment_saved"."person_id", "comment_saved"."published",
			 "person_block"."id", "person_block"."person_id", "person_block"."target_id", "person_block"."published",
			 "comment_like"."score"
			 FROM ((((((((((("comment"
			  INNER JOIN "person" ON ("comment"."creator_id" = "person"."id"))
			  INNER JOIN "post" ON ("comment"."post_id" = "post"."id"))
			  INNER JOIN "community" ON ("post"."community_id" = "community"."id"))
			  INNER JOIN "comment_aggregates" ON ("comment_aggregates"."comment_id" = "comment"."id"))
			  LEFT OUTER JOIN "community_person_ban" ON (("community"."id" = "community_person_ban"."community_id") AND ("community_person_ban"."person_id" = "comment"."creator_id")))
			  LEFT OUTER JOIN "community_follower" ON (("post"."community_id" = "community_follower"."community_id") AND ("community_follower"."person_id" = $1)))
			  LEFT OUTER JOIN "comment_saved" ON (("comment"."id" = "comment_saved"."comment_id") AND ("comment_saved"."person_id" = $2)))
			  LEFT OUTER JOIN "person_block" ON (("comment"."creator_id" = "person_block"."target_id") AND ("person_block"."person_id" = $3)))
			  LEFT OUTER JOIN "community_block" ON (("community"."id" = "community_block"."community_id") AND ("community_block"."person_id" = $4)))
			  LEFT OUTER JOIN "comment_like" ON (("comment"."id" = "comment_like"."comment_id") AND ("comment_like"."person_id" = $5)))
			  LEFT OUTER JOIN "local_user_language" ON (("comment"."language_id" = "local_user_language"."language_id") AND ("local_user_language"."local_user_id" = $6)))
			   
			  WHERE ((((("community"."local" = $7) AND (("community"."hidden" = $8) OR ("community_follower"."person_id" = $9)))
			   AND ("local_user_language"."language_id" IS NOT NULL))
			   AND ("community_block"."person_id" IS NULL)) AND ("person_block"."person_id" IS NULL))
			   ORDER BY "comment_aggregates"."hot_rank" DESC
			LIMIT $10
			OFFSET $11
			;`
			sqlParams = [
				// first 5 are person_id
				2, 2, 2, 2, 2,
				// 6 is local_user_id for language
				2,
				// 7 is local vs federated
				true,
				// 8 is hidden community
				false,
				// 9 is person_id
				2,
				// 10 limit, 11 offset
				40, 0
			]
			break;
		case 'pgrunning1':
			sqlQuery = `SELECT pid, query_start, usename, query 
			FROM pg_stat_activity 
			ORDER BY query_start desc
			;`
			break;
		case "curiousquery":
			// pg_stats claims this has a lot of rows, slow?
			sqlQuery = `SELECT "instance"."domain" 
			FROM ("instance" LEFT OUTER JOIN "federation_blocklist" ON ("federation_blocklist"."instance_id" = "instance"."id"))
			 WHERE ("federation_blocklist"."id" IS NULL)
			;`
			break;
		case "commentpath0":
			// https://github.com/LemmyNet/lemmy/issues/3741
			sqlQuery = `SELECT id, post_id, published, updated, ap_id, path, deleted, removed, *
			FROM comment
			WHERE path = '0'
			ORDER BY published DESC
			LIMIT 100
			;`
			break;
		case "fix0_commentpath0":
			// fix the one broken comment in my database
			sqlQuery = `
			UPDATE comment
			SET path='0.264471'
			WHERE id = 264471
			;`
			break;
		case "curious_dualjoin1":
			sqlQuery = `select count(*)
			from (
			  select c.creator_id from comment c
			  inner join person u on c.creator_id = u.id
			  inner join person pe on c.creator_id = pe.id
			  where c.published > ('now'::timestamp - INTERVAL '12 HOURS') 
			  and u.local = true
			  and pe.bot_account = false
			) a
			;`
			break;

		case "curious_performance0":
			// does it really need to go into the comment table, can't we hit fresher indexes on
			//   comment_aggregates? can counts be summed from other aggregate rows?
			//   "<@" is "contains" in PostgreSQL
			//   is it just a string match? what happens with:
			//     '0.1359561'
			//     '0.13595617' value?
			sqlQuery = `
			update comment_aggregates ca set child_count = c.child_count
			from (
			   select c.id, c.path, count(c2.id) as child_count from comment c
			   join comment c2 on c2.path <@ c.path and c2.path != c.path
			   and c.path <@ '0.1359561'
			   group by c.id
			     ) as c
			where ca.comment_id = c.id
			;`
			break;
		case "curious_performance1":
			sqlQuery = `
				select c.id, c.path, count(c2.id) as child_count from comment c
				join comment c2 on c2.path <@ c.path and c2.path != c.path
				and c.path <@ '0.1359561'
				group by c.id
			;`
			break;
		case "curious_performance2":
			sqlQuery = `
				select c.id, c.path from comment c
				join comment c2 on c2.path <@ c.path and c2.path != c.path
				and c.path <@ '0.1359561'
			;`
			break;

		case "curious_performance3":
			// rust code: let top_parent = format!("0.{}", parent_id);
			sqlQuery = `
				select c.id, c.comment_id, c.path from comment c
				join comment c2 on c2.path <@ c.path and c2.path != c.path
				and c.path <@ '0.'
				LIMIT 2500
			;`
			break;

		case "curious_comment_child0":
			sqlQuery = `
			UPDATE comment_aggregates ca
			 SET child_count = c.child_count
			 FROM (
			 	SELECT c.id, c.path, count(c2.id) as child_count
				   FROM comment c
				   join comment c2 on c2.path <@ c.path
				   and c2.path != c.path
				   and c.path <@ '0.1624758'
				   group by c.id
				  ) as c
				where ca.comment_id = c.id”
			;`
			break;
		case "curious_comment_child0out":
			// which new comment triggered this? does entire tree need to be hit?
			// comment_aggregates set child_count comment_id 1630788 parent_id 1495576 top_parent 0.1495576 parent_path Ltree("0.1495576.1533116.1550665.1551301.1552433.1552634.1553721.1556462.1558492.1565954.1581787.1606263.1630787")
			sqlQuery = `
				SELECT c.id, c.path, count(c2.id) as child_count
					FROM comment c
					join comment c2 on c2.path <@ c.path
					and c2.path != c.path
					and c.path <@ '0.1624758'
					group by c.id
			;`
			break;

		case "comment_child_count0":
			sqlQuery = `
				SELECT id, comment_id, child_count, published
				FROM comment_aggregates
				WHERE child_count > 200
				ORDER BY published DESC
				LIMIT 2000
			;`
			break;

		case "comment_child_count1":
			sqlQuery = `
				SELECT id, comment_id, child_count, published
				FROM comment_aggregates
				WHERE child_count > 200
				ORDER BY child_count DESC, published DESC
				LIMIT 2000
			;`
			break;

		case "mass_fix_comment_child_count":
			// disable:
			// break;
			// this is taken from migrations in lemmy_server
				sqlQuery = `
				-- Update the child counts
				UPDATE
					comment_aggregates ca
				SET
					child_count = c2.child_count
				FROM (
					SELECT
						c.id,
						c.path,
						count(c2.id) AS child_count
					FROM
						comment c
					LEFT JOIN comment c2 ON c2.path <@ c.path
						AND c2.path != c.path
				GROUP BY
					c.id) AS c2
				WHERE
					ca.comment_id = c2.id
					-- AND ca.id > 1359206
					AND ca.child_count = 999
			;`
			break;

		case "test_mass_fix_comment_child_count":
			// disable:
			// break;
				sqlQuery = `
					SELECT
						c.id,
						c.path,
						count(c2.id) AS child_count
					FROM
						comment c
					LEFT JOIN comment c2 ON c2.path <@ c.path
						AND c2.path != c.path
						-- guard against some bug not yet discovered in Lemmy https://github.com/LemmyNet/lemmy/issues/3821
						AND c.path <> '0'
						AND c.id > 1200000
				GROUP BY
					c.id
			;`
			break;

		case "test_mass_fix_comment_child_count1":
			// disable:
			// break;
			// output of this query has null id
				sqlQuery = `
					SELECT
						c.id,
						c.path
					FROM
						comment c
					LEFT JOIN comment c2 ON c2.path <@ c.path
						AND c2.path != c.path
						-- guard against some bug not yet discovered in Lemmy https://github.com/LemmyNet/lemmy/issues/3821
						-- AND c.path <> '0'
						AND nlevel(c.path) > 1
					ORDER BY c.path
					LIMIT 5000
			;`
			break;

			
		case "play_comment_child_count":
				sqlQuery = `
				SELECT count(distinct subpath(path, 1, 1))
				FROM comment
				WHERE nlevel(path) > 1
			;`
			break;


		case "play_comment_child_count1":
			sqlQuery = `
			-- If offset is negative, subpath starts that far from the end of the path
			SELECT subpath(path, -1, 1), count(*) AS children
			FROM   comment
			WHERE  path <> ''
			GROUP  BY 1
			ORDER  BY 2 DESC
			LIMIT  2000
			;`
			break;
		case "play_comment_child_count2":
			// a trunk comment has itself only as path id
			// 0.1549042
			sqlQuery = `
			SELECT subpath(path, -2, 1), count(*) AS children
			FROM   comment
			-- up path level to prototype query
			WHERE  nlevel(path) > 5
			GROUP  BY 1
			ORDER  BY 2 DESC
			LIMIT  2000
			;`
			break;
		case "play_comment_child_count3":
			sqlQuery = `
			SELECT id, path, subpath(path, -1, 1) AS subpath0
			FROM   comment
			-- exclude trunk comments
			WHERE  nlevel(path) > 5
			ORDER BY path
			LIMIT  2000
			;`
			break;

		case "track_change_log":
			sqlQuery = `
			SELECT id, tstamp, operation, statement, new_val
			FROM   logging.t_history
			ORDER BY tstamp DESC
			LIMIT  1000
			;`
			break;

		case "track_change_log_purge":
			sqlQuery = `
			DELETE
			FROM   logging.t_history
			;`
			break;

		case "pg_track_change_setup":
			// https://www.cybertec-postgresql.com/en/tracking-changes-in-postgresql/
			sqlQuery = `
			CREATE SCHEMA logging;
  
			CREATE TABLE logging.t_history (
					id              serial,
					tstamp          timestamp       DEFAULT now(),
					schemaname      text,
					tabname         text,
					operation       text,
					statement       text,
					who             text            DEFAULT current_user,
					new_val         jsonb,
					old_val         jsonb
			);

			CREATE OR REPLACE FUNCTION change_statement_trigger() RETURNS trigger AS $$
			BEGIN
				IF      TG_OP = 'INSERT'
				THEN
					INSERT INTO logging.t_history (tabname, schemaname, operation, statement, new_val)
						VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, current_query(), row_to_json(NEW));
						RETURN NEW;
				ELSIF   TG_OP = 'UPDATE'
				THEN
					INSERT INTO logging.t_history (tabname, schemaname, operation, statement, new_val, old_val)
						VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, current_query(),
							row_to_json(NEW), row_to_json(OLD));
					RETURN NEW;
				ELSIF   TG_OP = 'DELETE'
				THEN
					INSERT INTO logging.t_history (tabname, schemaname, operation, statement, old_val)
						VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, current_query(), row_to_json(OLD));
					RETURN OLD;
				END IF;
			END;
			$$ LANGUAGE 'plpgsql' SECURITY DEFINER;
			`
			break;
		case "pg_trigger_track_change_install0":
			sqlQuery = `
			CREATE OR REPLACE TRIGGER trackchange_statements0 
			    AFTER UPDATE OF child_count ON comment_aggregates
					FOR EACH STATEMENT EXECUTE PROCEDURE change_statement_trigger();
			`
			break;

		case "pg_trigger_track_change_install1":
			sqlQuery = `
			CREATE OR REPLACE TRIGGER trackchange_statements1 
				AFTER UPDATE OF child_count ON comment_aggregates
					FOR EACH ROW
					WHEN (OLD.child_count = 999)
					EXECUTE PROCEDURE change_statement_trigger();
			`
			break;
	
		case "pg_trigger_track_change_remove":
			sqlQuery = `
			DROP TRIGGER trackchange_statements0 ON comment_aggregates
			;`
			break;
		
		case "mass_fix_comment_child_count1":
			// disable:
			// break;
				sqlQuery = `
				-- Update the child counts
				UPDATE
					comment_aggregates ca
				SET
					child_count = 999
				WHERE
					ca.id > 1298263
					AND ca.child_count > 200
			;`
			break;

		case "mass_fix_comment_child_count2":
			// disable:
			// break;
				sqlQuery = `
				DO
				$$
				DECLARE rec RECORD;
				DECLARE comment RECORD;

				BEGIN
					RAISE NOTICE 'catzero begin';

					FOR rec IN SELECT comment_id, child_count
					FROM comment_aggregates
					WHERE child_count = 999
					LIMIT 2

					LOOP 
						-- comment = SELCT subpath(path, 0, 1) FROM comment WHERE id = rec.comment_id;
						RAISE NOTICE 'catzero % %',
						rec.comment_id,
						rec.child_count
						;

						--UPDATE comment_aggregates ca
						--SET child_count = c.child_count
						--  FROM ( select c.id, c.path, count(c2.id) as child_count
						--	FROM comment c join comment c2 on c2.path <@ c.path
						--	  AND c2.path != c.path
						--	  AND c.path <@ (SELCT subpath(c.path, 0, 1) FROM comment WHERE id = rec.comment_id)
						--	GROUP BY c.id ) as c
						--	WHERE ca.comment_id = c.id
					END LOOP;

				END;
				$$
			;`
			break;

		case "curious_no_dualjoin1":
			sqlQuery = `select count(*)
			from (
				select c.creator_id from comment c
				inner join person u on c.creator_id = u.id
				where c.published > ('now'::timestamp - INTERVAL '12 HOURS') 
				and u.local = true
				and u.bot_account = false
			) a
			;`
			break;
		case "posts_featured_community":
			sqlQuery = `SELECT post.id, post.name, post.creator_id, post.community_id, c.name AS community_name, post.published, post.updated,
				post.ap_id, post.local, post.featured_local, post.featured_community, post.*
			FROM post
			INNER JOIN community c ON c.id = post.community_id
			WHERE post.featured_community=true
			ORDER BY post.published DESC
			LIMIT 100
			;`
			break;
		case "posts_aggregates_featured_community":
			sqlQuery = `SELECT *
			FROM post_aggregates
			WHERE featured_community=true
			ORDER BY published DESC
			LIMIT 100
			;`
			break;
		case "posts_removed":
			sqlQuery = `SELECT post.id, post.name, post.creator_id, post.community_id, c.name AS community_name, post.published, post.updated,
				post.ap_id, post.local, post.featured_local, post.featured_community, post.*
			FROM post
			INNER JOIN community c ON c.id = post.community_id
			WHERE post.removed=true
			ORDER BY post.published DESC
			LIMIT 100
			;`
			break;
		case "pgcounts":
			sqlQuery = `SELECT table_schema, table_name, 
			(xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
				FROM (
					SELECT table_name, table_schema, 
						query_to_xml(format('select count(*) as cnt from %I.%I', table_schema, table_name), false, true, '') as xml_count
					FROM information_schema.tables
					WHERE table_schema = 'public' --<< change here for the schema you want
				) t
			    ORDER BY table_name
			;`
			break;
		case "communitypending":
			sqlQuery = "SELECT * FROM community_follower WHERE pending='t';"
			break;
		case 'communitypending1':
			sqlQuery = `SELECT person_id, p.name AS username, community_id, c.name AS community, i.domain, community_follower.published AS "cf_published"
			FROM community_follower
			INNER JOIN person p ON p.id = community_follower.person_id
			INNER JOIN community c ON c.id = community_follower.community_id
			INNER JOIN instance i ON i.id = c.instance_id
			WHERE pending='t'
			ORDER BY community_follower.published
			;`
			break;
		case 'federatedpostcount':
			sqlQuery = `
			SELECT a.community_id, c.name, a.post_count, c.actor_id, c.published
			FROM (
				SELECT
					community_id,
					COUNT (*) AS post_count
				FROM
					post
				WHERE
					local=false
				GROUP BY
					community_id
			) a INNER JOIN community c on c.id = a.community_id
			ORDER BY a.post_count DESC
			LIMIT 2000
			;`
			break;
		case 'federatedcommentcount':
			sqlQuery = `
			SELECT a.post_id, c.community_id, a.comment_count, c.published, c.name
			FROM (
				SELECT
					post_id,
					COUNT (*) AS comment_count
				FROM
					comment
				WHERE
					local=false
				GROUP BY
					post_id
			) a INNER JOIN post c on c.id = a.post_id
			ORDER BY a.comment_count DESC
			;`
			break;
		case 'federatedcommentcount2':
			sqlQuery = `
			SELECT c.instance_id, instance.domain, COUNT(*) AS comment_count
			FROM comment a
			INNER JOIN person c ON a.creator_id = c.id
			INNER JOIN instance ON c.instance_id = instance.id
			WHERE a.creator_id IN (SELECT id FROM person WHERE local=false)
			GROUP BY c.instance_id, instance.domain
			ORDER BY comment_count DESC
			;`
			break;
		case 'federatedcommentcount1':
			sqlQuery = `
			SELECT a.id AS "comment_id", a.post_id, c.id AS "person_id", c.local, c.instance_id, c.published, c.name
			FROM comment a
			INNER JOIN person c ON a.creator_id = c.id
			LIMIT 10
			;`
			// ("comment" INNER JOIN "person" ON ("comment"."creator_id" = "person"."id")
			break;
		case 'posts':
			sqlQuery = `SELECT id, name, creator_id, community_id, published, updated,
			   ap_id, local 
			FROM post
			WHERE published >= NOW() - INTERVAL '1 HOUR'
			ORDER BY published
			;`
			break;
		case 'raw_posts':
			sqlQuery = `SELECT id, name, creator_id, community_id, published, updated,
			   ap_id, local, *
			FROM post
			ORDER BY published DESC
			LIMIT 20
			;`
			break;
		case 'raw_posts1':
			sqlQuery = `SELECT id, name, creator_id, community_id, published, updated,
				ap_id, local, *
			FROM post
			ORDER BY id DESC
			LIMIT 30
			;`
			break;

		case 'raw_person':
			sqlQuery = `SELECT id, actor_id, name, display_name, published, local, instance_id, matrix_user_id, *
			FROM person
			ORDER BY published DESC
			LIMIT 10
			;`
			break;
		case 'raw_community':
			sqlQuery = `SELECT id, name, title, published, local, description, *
			FROM community
			ORDER BY published DESC
			LIMIT 100
			;`
			break;
		case 'comments':
			sqlQuery = `SELECT id, post_id, published, ap_id, path
			FROM comment
			WHERE published >= NOW() - INTERVAL '1 HOUR'
			ORDER BY published
			;`
			break;
		case 'raw_comments':
			sqlQuery = `SELECT id, post_id, published, ap_id, path, *
			FROM comment
			ORDER BY published DESC
			LIMIT 10
			;`
			break;
		case 'raw_comment_reply':
			sqlQuery = `SELECT id, *
			FROM comment_reply
			ORDER BY PUBLISHED DESC
			LIMIT 25
			;`
			break;
		case 'raw_instance':
			sqlQuery = `SELECT id, *
			FROM instance
			LIMIT 10
			;`
			break;
		case 'raw_comment_like':
			sqlQuery = `SELECT id, * FROM comment_like ORDER BY published DESC LIMIT 40;`
			break;
		case 'raw_comment_aggregates':
			sqlQuery = `SELECT id, * FROM comment_aggregates ORDER BY published DESC LIMIT 40;`
			break;
		case 'raw_post_like':
			sqlQuery = `SELECT id, * FROM post_aggregates ORDER BY published DESC LIMIT 40;`
			break;
		case 'raw_post_aggregates':
			sqlQuery = `SELECT id, * FROM post_aggregates ORDER BY published DESC LIMIT 40;`
			break;
		case 'raw_mod_remove_post':
			sqlQuery = `SELECT id, * FROM mod_remove_post ORDER BY when_ DESC LIMIT 60;`
			break;
		case 'raw_mod_lock_post':
			sqlQuery = `SELECT id, * FROM mod_lock_post ORDER BY when_ DESC LIMIT 60;`
			break;
		case 'raw_mod_feature_post':
			sqlQuery = `SELECT id, * FROM mod_feature_post ORDER BY when_ DESC LIMIT 60;`
			break;
		case 'raw_site_aggregates':
			sqlQuery = `SELECT id, * FROM site_aggregates ORDER BY id LIMIT 2000;`
			break;
		case 'raw_person_aggregates':
			sqlQuery = `SELECT id, * FROM person_aggregates ORDER BY id LIMIT 2000;`
			break;
		case 'raw_site':
			sqlQuery = `SELECT id, name, sidebar, published, updated, description FROM site ORDER BY id LIMIT 2000;`
			break
		case 'raw_local_site':   // only 1 row
			sqlQuery = `SELECT id, * FROM local_site ORDER BY id LIMIT 2000;`
			break
		case 'raw_community_aggregates':
			sqlQuery = `SELECT id, * FROM community_aggregates ORDER BY id LIMIT 2000;`
			break;
		case 'localusers':
			sqlQuery = `SELECT local_user.id, person_id, p.name AS username, email, email_verified, accepted_application, validator_time
			FROM local_user
			inner join person p on p.id = local_user.person_id
			ORDER BY local_user.person_id
			;`
			break;
		case 'activity':
			sqlQuery = `SELECT id, local, sensitive, published, ap_id, *
			FROM activity
			ORDER BY published DESC
			LIMIT 15
			;`
			break;
		case 'activitylocal':
			sqlQuery = `SELECT id, local, sensitive, published, ap_id
			FROM activity
			WHERE published >= NOW() - INTERVAL '1 HOUR'
			AND local=true
			ORDER BY published DESC
			;`
			break;
		case 'activityremote':
			sqlQuery = `SELECT id, local, sensitive, published, ap_id
			FROM activity
			WHERE published >= NOW() - INTERVAL '1 HOUR'
			AND local=false
			ORDER BY published DESC
			;`
			break;
		case 'comments_ap_id_hostname':
			// 2007 solution
			//   https://www.postgresql.org/message-id/247444.36947.qm@web50311.mail.re2.yahoo.com
			sqlQuery = `SELECT
			id, creator_id, post_id, published, ap_id,
			substring ( ap_id from '.*://\([^/]*)' ) as hostname
			from comment
			ORDER BY published DESC
			LIMIT 30
			;`
			break;
		case 'comments_ap_id_hostname0':
			// 2007 solution
			//   https://www.postgresql.org/message-id/247444.36947.qm@web50311.mail.re2.yahoo.com
			sqlQuery = `SELECT
			SUBSTRING( ap_id FROM '.*://([^/]*)' ) AS hostname,
			 COUNT(SUBSTRING( ap_id FROM '.*://([^/]*)' ))
			FROM comment
			GROUP BY hostname
			ORDER BY count DESC
			;`
			break;
		case 'comments_ap_id_hostname1':
			//   https://stackoverflow.com/questions/47528966/regex-for-postgresql-for-getting-domain-with-sub-domain-from-url-website
			sqlQuery = `SELECT 
			id, creator_id, post_id, published, ap_id,
			SUBSTRING (ap_id from '(?:.*://)?(?:www\.)?([^/?]*)') AS instance_domain     
		  	FROM comment
			ORDER BY published DESC
			LIMIT 30
			;`
			break;
		case 'comments_ap_id_hostname2':
			//   https://stackoverflow.com/questions/47528966/regex-for-postgresql-for-getting-domain-with-sub-domain-from-url-website
			sqlQuery = `SELECT 
			id, creator_id, post_id, published, ap_id,
		    REGEXP_REPLACE (ap_id, '^(https?://)?(www\.)?', '') AS instance_domain     
			FROM comment
			ORDER BY published DESC
			LIMIT 30
			;`
			break;
		case 'comments_ap_id_host_hour':
			// 2007 solution
			//   https://www.postgresql.org/message-id/247444.36947.qm@web50311.mail.re2.yahoo.com
			sqlQuery = `SELECT
			SUBSTRING( ap_id FROM '.*://([^/]*)' ) AS hostname,
			 COUNT(SUBSTRING( ap_id FROM '.*://([^/]*)' ))
			FROM comment
			WHERE published >= NOW() - INTERVAL '1 HOUR'
			GROUP BY hostname
			ORDER BY count DESC
			;`
			break;
		case 'comments_ap_id_host_12hour':
			// 2007 solution
			//   https://www.postgresql.org/message-id/247444.36947.qm@web50311.mail.re2.yahoo.com
			// ToDo: add interval picker to URL parameters
			sqlQuery = `SELECT
			SUBSTRING( ap_id FROM '.*://([^/]*)' ) AS hostname,
			 COUNT(SUBSTRING( ap_id FROM '.*://([^/]*)' ))
			FROM comment
			WHERE published >= NOW() - INTERVAL '12 HOURS'
			GROUP BY hostname
			ORDER BY count DESC
			;`
			break;
		case 'comments_ap_id_host_prev':    // prev = "previous", time period.
			// 2007 solution
			//   https://www.postgresql.org/message-id/247444.36947.qm@web50311.mail.re2.yahoo.com
			sqlQuery = `SELECT
			SUBSTRING( ap_id FROM '.*://([^/]*)' ) AS hostname,
				COUNT(SUBSTRING( ap_id FROM '.*://([^/]*)' ))
			FROM comment
			WHERE published >= NOW() - INTERVAL '${timeperiod} MINUTES'
			GROUP BY hostname
			ORDER BY count DESC
			;`
			timeperiodmessage = "-- <b>timeperiod " + timeperiod + " min</b> ";
			break;
		case 'posts_ap_id_host_prev':    // prev = "previous", time period.
			sqlQuery = `SELECT
			SUBSTRING( ap_id FROM '.*://([^/]*)' ) AS hostname,
				COUNT(SUBSTRING( ap_id FROM '.*://([^/]*)' ))
			FROM post
			WHERE published >= NOW() - INTERVAL '${timeperiod} MINUTES'
			GROUP BY hostname
			ORDER BY count DESC
			;`
			timeperiodmessage = "-- <b>timeperiod " + timeperiod + " min</b> ";
			break;
		case 'comments_ap_id_hostname3':
			//   https://stackoverflow.com/questions/47528966/regex-for-postgresql-for-getting-domain-with-sub-domain-from-url-website
			sqlQuery = `SELECT 
			id, creator_id, post_id, published, ap_id
			FROM comment
			ORDER BY published DESC
			LIMIT 30
			;`
			break;
		case 'try_trigger_code0':
			sqlQuery = `SELECT 
			c.id,
			count(distinct p.id) as posts,
			count(distinct ct.id) as comments
			from community c
			left join post p on c.id = p.community_id
			left join comment ct on p.id = ct.post_id
			group by c.id
			LIMIT 2000
			;`
			break;
		case 'try_trigger_code1':
			sqlQuery = `SELECT 
			coalesce(cd.posts, 0), coalesce(cd.comments, 0)
			FROM community_aggregates ca
				from ( 
				  select 
				  c.id,
				  count(distinct p.id) as posts,
				  count(distinct ct.id) as comments
				  from community c
				  left join post p on c.id = p.community_id
				  left join comment ct on p.id = ct.post_id
				  group by c.id
				) cd
			where ca.community_id = 2;
			;`
			break;
		case 'comment_like_person_prev':    // prev = "previous", time period.
			sqlQuery = `SELECT person_id,
				COUNT(*)
			FROM comment_like
			WHERE published >= NOW() - INTERVAL '${timeperiod} MINUTES'
			GROUP BY person_id
			ORDER BY count DESC
			LIMIT 100
			;`
			timeperiodmessage = "-- <b>timeperiod " + timeperiod + " min</b> ";
			break;

		case 'try_person_aggregates_update_count0':
			// -- Recalculate proper comment count.
			// ToDo: restrict run of this in lemmy_helper, 2 seconds
			sqlQuery = `UPDATE person_aggregates
			SET comment_count = cnt.count
			FROM (
			SELECT creator_id, count(*) AS count FROM comment
			WHERE deleted='f' AND removed='f'
			GROUP BY creator_id
				) cnt
			WHERE person_aggregates.person_id = cnt.creator_id
			;`
			break;

		case 'try_person_aggregates_update_score0':
			// -- Recalculate proper comment score.
			// ToDo: restrict run of this in lemmy_helper, 30 seconds
			break;
			sqlQuery = `UPDATE person_aggregates ua
			SET comment_score = cd.score
			FROM (
				SELECT u.id AS creator_id,
					coalesce(0, sum(cl.score)) as score
				-- User join because comments could be empty
				FROM person u
					LEFT JOIN comment c ON u.id = c.creator_id AND c.deleted = 'f' AND c.removed = 'f'
					LEFT JOIN comment_like cl ON c.id = cl.comment_id
				GROUP BY u.id
			) cd
			WHERE ua.person_id = cd.creator_id
			;`
			break;
		case 'try_person_aggregates_update_count1':
			// -- Recalculate proper post count.
			// ToDo: restrict run of this in lemmy_helper, 2 seconds
			sqlQuery = `UPDATE person_aggregates
			SET post_count = cnt.count
			FROM (
			SELECT creator_id, count(*) AS count FROM post
			WHERE deleted='f' AND removed='f'
			GROUP BY creator_id
				) cnt
			WHERE person_aggregates.person_id = cnt.creator_id
			;`
			break;
		case 'try_person_aggregates_update_score1':
			// -- Recalculate proper post score.
			// ToDo: restrict run of this in lemmy_helper, 10 seconds
			break;
			sqlQuery = `UPDATE person_aggregates ua
			SET post_score = pd.score
			FROM (
				SELECT u.id AS creator_id,
					coalesce(0, sum(pl.score)) AS score
					-- User join because posts could be empty
				FROM person u
					LEFT JOIN post p ON u.id = p.creator_id AND p.deleted = 'f' AND p.removed = 'f'
					LEFT JOIN post_like pl ON p.id = pl.post_id
				GROUP BY u.id
			) pd
			WHERE ua.person_id = pd.creator_id
			;`
			break;
		default:
			console.error("/routes/query did not recognize params ER001");
			console.log(incoming.params);
			return {
				queryName: "error, unrecognized query name, ER001",
				outRows: { rows: [] },
				outRowsRaw: [],
				errorCode: 1,
				errorMessage: "unrecognied query name, ER001"
			}
	}

	let timeConnect = 0.0;
	let timeQuery = 0.0;

    if (sqlQuery) {
		const client = new Client()
		const startTime = process.hrtime();
		await client.connect()
		timeConnect = parseHrtimeToSeconds(process.hrtime(startTime))

		try {
			const queryTimeStart = process.hrtime();
			const res = await client.query(sqlQuery, sqlParams)
			timeQuery = parseHrtimeToSeconds(process.hrtime(queryTimeStart))
			// outRows = JSON.stringify(res.rows);
			if (sqlObjectBreak) {
				JSON.parse(JSON.stringify(res.rows))
			} else {
				outRowsRaw = res.rows;
			}
		} catch (err) {
			console.error(err);
			return {
				queryName: "error, exception on query execution, ER002",
				outRows: { rows: [] },
				outRowsRaw: [],
				errorCode: 2,
				errorMessage: err.message
			}
		} finally {
			await client.end()
		}
	}

	return {
		queryName: incoming.params.name,
		outRows: outRows,
		outRowsRaw: outRowsRaw,
		timeQuery: timeQuery,
		timeConnect: timeConnect,
		output: output,
		timeperiod: timeperiod,
		timeperiodmessage: timeperiodmessage,
		serverResultTime: (new Date().toISOString()),
		errorCode: 0,
		errorMessage: ""
	}
}


function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}

