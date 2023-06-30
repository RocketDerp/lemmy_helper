#! /usr/bin/env node

import { program } from "commander";
import { posts, testPost, testPost2, loopTest0, compareComments, rawPost } from "./commands/posts.js"
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
.description('two servers posts comparison')
.option('-c, --communityname <string>', 'Lemmy community name', "asklemmy@lemmy.ml")
.option('-s0, --server0 <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://lemmy.ml/")
.option('-s1, --server1 <string>', 'Lemmy server URL, https://sh.itjust.works/ format', "https://sh.itjust.works/")
.action((options) => {
    const communityName = options.communityname;
    const server0 = options.server0;
    const server1 = options.server1;
    console.log('compare posts. Community name %s server0 %s server1 %s', communityName, server0, server1);
    console.log(JSON.stringify(options));
    posts(communityName, server0, server1);
});

program
.command('testpost')
.description('lemmy post parsing')
.option('-p, --postid <number>', 'Lemmy post ID, localized to that specific server', 123406)
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://lemmy.ml/")
.action((options) => {
    const postID = options.postid;
    const server = options.server;
    console.log('testpost command postID %d server %s', postID, server);
    console.log(JSON.stringify(options));
    testPost(postID, server);
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
.command('testpost2')
.action((options) => {
     testPost2();
});

program
.command('looptest0')
.action((options) => {
     loopTest0();
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
.option('-c, --commentid <number>', 'Lemmy comment ID, localized to that specific server', 1016688)
.option('-cs, --commentscore <number>', 'Lemmy vote score: 0, 1, -1', 1)
.option('-lp, --looppause <number>', 'loop pause between iterations, in milliseconds', 15000)
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
.action((options) => {
    testCommunitiesTickle(options);
});


program.parse()
