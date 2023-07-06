#! /usr/bin/env node

import { program } from "commander";
import { posts, posts_list_twoservers, testPost, compareComments, rawPost, loopPostList } from "./commands/posts.js"
import { testLemmyLogin, testVote, loopTestVote, testCommunities,
    testResolveCommunity, testCommunitiesTickle } from "./commands/sessions.js";


program
  .name('lemmy-helper-cli')
  .description('CLI to some of hte Lemmy-Helper code')
  .version('0.1.1');

program.command('split')
  .description('Split a string into substrings and display as an array')
  .argument('<string>', 'string to split')
  .option('--first', 'display just the first substring')
  .option('-s, --separator <char>', 'separator character', ',')
  .action((str, options) => {
    const limit = options.first ? 1 : undefined;
    console.log(str.split(options.separator, limit));
  });

program
.command('posts')
.description('two servers posts comparison for the same community, commuents on posts')
.option('-c, --communityname <string>', 'Lemmy community name', "asklemmy@lemmy.ml")
.option('-s0, --server0 <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://lemmy.ml/")
.option('-s1, --server1 <string>', 'Lemmy server URL, https://sh.itjust.works/ format', "https://sh.itjust.works/")
.action((options) => {
    console.log('compare posts. Community name %s server0 %s server1 %s', options.communityname, options.server0, options.server1);
    posts(options);
});


program
.command('postslisttwoservers')
.description('two servers posts comparison for the same community')
.option('-c, --communityname <string>', 'Lemmy community name', "asklemmy@lemmy.ml")
.option('-s0, --server0 <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://lemmy.ml/")
.option('-s1, --server1 <string>', 'Lemmy server URL, https://sh.itjust.works/ format', "https://sh.itjust.works/")
.action((options) => {
    console.log('compare posts. Community name %s server0 %s server1 %s', options.communityname, options.server0, options.server1);
    posts_list_twoservers(options);
});


program
.command('testpost')
.description('lemmy comment loading for a specific post')
.option('-p, --postid <number>', 'Lemmy post ID, localized to that specific server', 290936)
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://lemm.ee/")
.option('-li, --limit <number>', 'limit to comments', 25)
.option('-p, --page <number>', 'page of comments list', 1)
.option('-ob, --orderby <string>', 'sort by', "New")
.action((options) => {
    testPost(options);
});

program
.command('rawpost')
.description('lemmy raw post JSON')
.option('-p, --postid <number>', 'Lemmy post ID, localized to that specific server', 123406)
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://lemmy.ml/")
.action((options) => {
    const postID = options.postid;
    const server = options.server;
    rawPost(postID, server);
});

program
.command('postcomments')
.description('two servers comparison of comments for a post')
.option('-p0, --postid0 <number>', 'Lemmy post ID, localized to that specific server0', 179199)
.option('-p1, --postid1 <number>', 'Lemmy post ID, localized to that specific server1', 10825)
.option('-s0, --server0 <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://lemmy.ml/")
.option('-s1, --server1 <string>', 'Lemmy server URL, https://sh.itjust.works/ format', "https://sh.itjust.works/")
.action((options) => {
    const communityName = options.communityname;
    const server0 = options.server0;
    const server1 = options.server1;
    const post0 = options.postid0;
    const post1 = options.postid1;
    console.log('compare comments. server0 %s post %d server1 %s post %d', server0, post0, server1, post1);
    console.log(JSON.stringify(options));
    compareComments(server0, post0, server1, post1);
});

program
.command('looppostlist')
.description('loop post list')
.option('-c, --communityname <string>', 'Lemmy community name', "")
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://lemm.ee/")
.option('-lp, --looppause <number>', 'loop pause between iterations, in milliseconds', 12000)
.option('-li, --loopiterations <number>', 'number of loop iterations', 100)
.option('-ob, --orderby <string>', 'sort by', "New")
.option('-li, --limit <number>', 'limit to list length', 12)
.option('-p, --page <number>', 'page of list', 1)
.action((options) => {
    loopPostList(options);
});

program
.command('testlogin')
.description('lemmy test login')
.option('-u, --username <string>', 'Lemmy username', "testuser0")
.option('-u, --password <string>', 'Lemmy password', "nevermatch000AZ#fm")
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://enterprise.lemmy.ml/")
.action((options) => {
    testLemmyLogin(options.server, options.username, options.password);
});

program
.command('testvote')
.description('lemmy test vote on a comment')
.requiredOption('-j, --jwt <string>', 'Lemmy JWT authentication token for server session')
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://enterprise.lemmy.ml/")
.action((options) => {
    testVote(options.server, options.jwt);
});

program
.command('looptestvote')
.description('lemmy vote for comment, loop, mostly for performance testing')
.requiredOption('-j, --jwt <string>', 'Lemmy JWT authentication token for server session')
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://enterprise.lemmy.ml/")
.option('-c, --commentid <number>', 'Lemmy comment ID, localized to that specific server', 100)
.option('-cs, --commentscore <number>', 'Lemmy vote score: 0, 1, -1', 1)
.option('-lp, --looppause <number>', 'loop pause between iterations, in milliseconds', 15000)
.option('-li, --loopiterations <number>', 'number of loop iterations', 100)
.action((options) => {
    loopTestVote(options);
});

program
.command('communities')
.description('lemmy communities list')
.option('-j, --jwt <string>', 'Lemmy JWT authentication token for server session', "blahblahblahblah-this-is-test")
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://enterprise.lemmy.ml/")
.option('-s, --search <string>', 'search for community', "asklemmy")
.action((options) => {
    testCommunities(options);
});

program
.command('resolvecommunity')
.description('lemmy resolve remote community')
.requiredOption('-j, --jwt <string>', 'Lemmy JWT authentication token for server session')
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://enterprise.lemmy.ml/")
.option('-s, --search <string>', 'search for community', "!asklemmy@lemmy.ml")
.action((options) => {
    testResolveCommunity(options);
});

program
.command('communitiestickle')
.description('lemmy communities tickle between two servers, server0 is source, server1 is destination')
.requiredOption('-j, --jwt <string>', 'Lemmy JWT authentication token for server session with server1')
.option('-s0, --server0 <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://lemm.ee/")
.option('-s1, --server1 <string>', 'Lemmy server URL, https://sh.itjust.works/ format', "https://bulletintree.com/")
.option('-s, --search <string>', 'search for community', "asklemmy")
.option('-f, --follow', 'after ResolveObject tickle, follow community')
.option('-ff, --fastfollow', "requires follow, fastfollow checks if already subscribed before following")
.action((options) => {
    testCommunitiesTickle(options);
});


program.parse()
