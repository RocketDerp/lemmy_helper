#! /usr/bin/env node

import { program } from "commander";
import { posts, testPost, testPost2 } from "./commands/posts.js"


program
    .command('posts')
    .description('two servers posts comparison')
    .action(posts)
    ;

program
.command('testpost')
.option('-x, --x-option', 'command test option')
.action((options) => {
    console.log('test command executed');
    console.log(JSON.stringify(options, null, 2));
    testPost();
});

program
.command('testpost2')
.option('-x, --x-option', 'command test option')
.action((options) => {
     testPost2();
});


program.parse()
