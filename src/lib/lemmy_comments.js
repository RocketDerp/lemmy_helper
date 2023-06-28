
// source of function: https://github.com/ando818/lemmy-ui-svelte/blob/main/src/lib/components/Comment.svelte
// Apache license
export function convertToTree(comments) {
    let commentTree = [];
    let commentsSorted = comments.sort((a, b) => {return commentSort(a, b); });

    for (let i = 0; i < commentsSorted.length; i++) {
        let comment = commentsSorted[i];
        let path = comment.comment.path;
        let pathSplit = path.split('.');
        let root = commentTree;

        for (let j = 1; j < pathSplit.length; j++) {
            let id = pathSplit[j];
            let index = root.findIndex((c) => c.id == id);
            if (index == -1) {
                root.push({
                    id: comment.comment.id,
                    comment,
                    children: []
                });
            } else {
                root = root[index].children;
            }
        }
    }

    consoleCommentTree(commentTree);
    return commentTree;
}


function commentSort (a, b) {
    if (a.comment.path.length === b.comment.path.length) {
        return a.comment.path.localeCompare(b.comment.path, undefined, { numeric: true });
    }
    return a.comment.path.length - b.comment.path.length;
};


export function compareTwoCommentsSamePost(comments, comments1) {
    let commentTree = [];
    //let commentsSorted = comments.sort((a, b) => {return commentSort(a, b); });
    //let commentsSorted1 = comments1.sort((a, b) => {return commentSort(a, b); });
    let commentsSorted = comments;
    let commentsSorted1 = comments1;
    let results = {
        comments: comments,
        comments1: comments1,
        commentMissing: [],
        commentUnequal: []
    }

    let onJ = -1;

    for (let i = 0; i < commentsSorted.length; i++) {
        let comment = commentsSorted[i];
        //let path = comment.comment.path;
        //let pathSplit = path.split('.');
        //let root = commentTree;

        let found = false;
        for (let j = 0; j < commentsSorted1.length; j++) {
            if (comment.comment.published == commentsSorted1[j].comment.published) {
                let jJump = j - onJ;
                if (jJump > 1) {
                    // console.log("missing j %d jJump %d onJ %d", j, jJump, onJ);
                    // some skips are detected.
                    for (let m = 1; m < jJump; m++) {
                        results.commentMissing.push(commentsSorted1[onJ + m]);
                    }
                }
                onJ = j;
                found = true;
                if (comment.comment.content !== commentsSorted1[j].comment.content) {
                    results.commentUnequal.push(comment.comment);
                }
                // found match. exit loop.
                break;
            }
        }

        if (!found) {
            // console.log(comment);
            results.commentMissing.push(comment);
        }

        /*
        for (let k = 1; k < pathSplit.length; k++) {
            let id = pathSplit[k];
            let index = root.findIndex((c) => c.id == id);
            if (index == -1) {
                root.push({
                    id: comment.comment.id,
                    comment,
                    children: []
                });
            } else {
                root = root[index].children;
            }
        }
        */
    }

    // this assumes they are sorted by published time. Should this code search the commentsSorted array?
    if (commentsSorted1.length > commentsSorted.length) {
        // console.log("missing trying to balance %d > %d onJ %d", commentsSorted1.length, commentsSorted.length, onJ);
        let onJplus = onJ + 1;
        if (onJplus < commentsSorted1.length) {
            for (let j = onJplus; j < commentsSorted1.length; j++) {
                results.commentMissing.push(commentsSorted1[j]);
            }
        }
    }

    // consoleCommentsNaked(commentMissing);
    //console.log(commentMissing[0]);
    //console.log("commentMissing %d unequal %d server0 %d server1 %d", commentMissing.length,
    //   commentUnequal.length, comments.length, comments1.length
    //)
    return results;
}


// Parameter is an array of { x, y } numbers of PostID
export function compareCommentsPostsListID(postsListID) {
    for (let i = 0; i < postsListID.length; i++) {
        let post0 = postsListID[i][0];
        let post1 = postsListID[i][1];

        console.log("%d other %d", post0, post1);
    }
}


function consoleOneCommentNaked(c) {
    const indentOut = "***".repeat(c.comment.path.split(".").length - 2);
    console.log("%s%d %s vote %d %s %s children ?",
        indentOut,
        c.comment.id, c.comment.path, c.counts.score,
        c.creator.actor_id, c.comment.published);
    console.log("   %s", c.comment.content);
}

export function consoleCommentsNaked(comments) {
    for (let i = 0; i < comments.length; i++) {
        let c = comments[i];
        if (i==0) {
            //console.log(c);
        }
        consoleOneCommentNaked(c);
    }
}


function consoleOneComment(c) {
    const indentOut = "***".repeat(c.comment.comment.path.split(".").length - 2);
    console.log("%s%d %s vote %d %s %s children %d",
        indentOut,
        c.id, c.comment.comment.path, c.comment.counts.score,
        c.comment.creator.actor_id, c.comment.comment.published, c.children.length);
    console.log("   %s", c.comment.comment.content);
    if (c.children.length > 0) {
        for (let i = 0; i < c.children.length; i++) {
            consoleOneComment(c.children[i]);
        }
    }
}

export function consoleCommentTree(commentTree) {
    for (let i = 0; i < commentTree.length; i++) {
        let c = commentTree[i];
        if (i==0) {
            //console.log(c);
        }
        consoleOneComment(c);
    }
}


export function convertToComments(tree) {
    let comments = [];
    tree.children.forEach((child) => {
        comments.push(child.comment);
    });
    return comments;
}

