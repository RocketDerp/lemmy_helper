#! /usr/bin/env node

import { program } from "commander";
import { posts, testPost, testPost2, loopTest0, compareComments, rawPost } from "./commands/posts.js"
import { testLemmyLogin, testVote } from "./commands/sessions.js";


program
  .name('lemmy-helper-cli')
  .description('CLI to some of hte Lemmy-Helper code')
  .version('0.1.0');

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
.option('-x, --x-option', 'command test option')
.action((options) => {
     testPost2();
});

program
.command('looptest0')
.option('-x, --x-option', 'command test option')
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
.description('lemmy test login')
.option('-j, --jwt <string>', 'Lemmy server JWT authenticatio ntokent for session', "blahblahblahblah-this-is-test")
.option('-s, --server <string>', 'Lemmy server URL, https://lemmy.ml/ format', "https://enterprise.lemmy.ml/")
.action((options) => {
    testVote(options.server, options.jwt);
});


program.parse()
