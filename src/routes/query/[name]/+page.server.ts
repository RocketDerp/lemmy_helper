import type { PageServerLoad } from './$types'
import { Client } from 'pg'


export const load: PageServerLoad = async (incoming) => {

	let sqlQuery;
	let sqlParams = [];
	let outRows = {};
	let outRowsRaw = [];
	let output = "all"

	console.log("--------- url")
	console.log(incoming.url)

	if (incoming.url.searchParams.get("output")) {
		output = incoming.url.searchParams.get("output");
	}

	// this switch statement gurads the parameter, only whitelist matching.
	switch (incoming.params.name) {
		case "test1":
			sqlQuery = 'SELECT $1::text as message';
			sqlParams = ['Hello world!'];
			break;
		case "locks":
			sqlQuery = "SELECT * FROM pg_locks;";
			break;
		case 'pgrunning':
			sqlQuery = `SELECT pid, age(clock_timestamp(), query_start), usename, query 
			FROM pg_stat_activity 
			WHERE query != '<IDLE>' AND query NOT ILIKE '%pg_stat_activity%' 
			ORDER BY query_start desc
			;`
			break;
		case 'pgstatements':
			// https://www.timescale.com/blog/identify-postgresql-performance-bottlenecks-with-pg_stat_statements/
			// install extension:
			//  https://pganalyze.com/docs/install/self_managed/02_enable_pg_stat_statements_deb
			//  sudo -iu postgres psql -c "ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';"
			sqlQuery = `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;`;
			sqlQuery = `
			SELECT queryid, calls, rows, mean_exec_time, query
		    FROM pg_stat_statements
			ORDER BY calls DESC
			;`
			break;
		case 'pgstatements1':
			sqlQuery = `
			SELECT queryid, calls, rows, mean_exec_time, query, *
			FROM pg_stat_statements
			ORDER BY calls DESC
			;`
			break;
		case 'explain_posts':
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
 OFFSET $17			;`
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
		case 'pgrunning1':
			sqlQuery = `SELECT pid, query_start, usename, query 
			FROM pg_stat_activity 
			ORDER BY query_start desc
			;`
			break;
		case "pgcounts":
			sqlQuery = `select table_schema, table_name, 
			(xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
				from (
				select table_name, table_schema, 
						query_to_xml(format('select count(*) as cnt from %I.%I', table_schema, table_name), false, true, '') as xml_count
				from information_schema.tables
				where table_schema = 'public' --<< change here for the schema you want
				) t
			;`
			break;
		case "communitypending":
			sqlQuery = "SELECT * FROM community_follower WHERE pending='t';"
			break;
		case 'communitypending1':
			sqlQuery = `SELECT person_id, p.name AS username, community_id, c.name as community, i.domain, community_follower.published
			FROM community_follower
			inner join person p on p.id = community_follower.person_id
			inner join community c on c.id = community_follower.community_id
			inner join instance i on c.instance_id = i.id
			WHERE pending='t'
			ORDER BY community_follower.published
			;`
			break;
		case 'federatedpostcount':
			sqlQuery = `
			SELECT a.community_id, c.name, a.post_count
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
			SELECT c.instance_id, COUNT(*) AS comment_count
			FROM comment a
			INNER JOIN person c ON a.creator_id = c.id
			INNER JOIN instance ON c.instance_id = instance.id
			WHERE a.creator_id IN (SELECT id FROM person WHERE local=false)
			GROUP BY c.instance_id
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
			LIMIT 10
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
			LIMIT 10
			;`
			break;
		case 'raw_instance':
			sqlQuery = `SELECT id, *
			FROM instance
			LIMIT 10
			;`
			break;
		case 'localusers':
			sqlQuery = `SELECT local_user.id, person_id, p.name as username, email, email_verified, accepted_application, validator_time
			FROM local_user
			inner join person p on p.id = local_user.person_id
			ORDER BY local_user.person_id
			;`
			break;
		case 'activity':
			sqlQuery = `SELECT id, local, sensitive, published, ap_id, *
			FROM activity
			ORDER BY published
			LIMIT 15
			;`
			break;
		case 'activitylocal':
			sqlQuery = `SELECT id, local, sensitive, published, ap_id
			FROM activity
			WHERE published >= NOW() - INTERVAL '1 HOUR'
			AND local=true
			ORDER BY published
			;`
			break;
		case 'activityremote':
			sqlQuery = `SELECT id, local, sensitive, published, ap_id
			FROM activity
			WHERE published >= NOW() - INTERVAL '1 HOUR'
			AND local=false
			ORDER BY published
			;`
			break;
		default:
			console.error("/routes/query did not recognize params ER001");
			console.log(incoming.params);
			return {
				queryName: "error, unrecognized query name, ER001",
				outRows: { rows: [] },
				outRowsRaw: []
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
			outRowsRaw = res.rows;
		} catch (err) {
			console.error(err);
			return {
				queryName: "error, exception on query execution, ER002",
				outRows: { rows: [] },
				outRowsRaw: []
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
		output: output
	}
}

function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}
