
// source of function: https://github.com/ando818/lemmy-ui-svelte/blob/main/src/lib/components/Comment.svelte
// Apache license
export function convertToTree(comments) {
    let commentTree = [];
    let commentsSorted = comments.sort((a, b) => {
        if (a.comment.path.length === b.comment.path.length) {
            return a.comment.path.localeCompare(b.comment.path, undefined, { numeric: true });
        }
        return a.comment.path.length - b.comment.path.length;
    });

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

