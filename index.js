#! /usr/bin/env node

// const { program } = require('commander')
// const posts = require('./commands/posts')
import { program } from "commander";
import { posts } from "./commands/posts.js"

program
    .command('posts')
    .description('two servers posts comparison')
    .action(posts)


program.parse()
