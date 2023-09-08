import http from "http";
import fs from "fs";
import crypto from "crypto";

const websiteTemplate = (bodyContent = "", redirect) => `
<html>
    <head>
        <title>My bookmarks</title>
        <link rel="icon" href="/favicon.svg" type="image/svg">
        ${redirect ? ('<meta http-equiv="Refresh" content="2; URL=' + redirect + '">') : ''}
    </head>
    <body>
        <main>${bodyContent}</main>
    </body>
</html>`;

const toLink = (bookmark) => 
    `<a href='${bookmark.url}' target='_blank'>${bookmark.title || bookmark.url}</a>`;

const added = (bookmark) => `Added link ${toLink(bookmark)} to inbox.`;

const toDetails = (bookmark) => `
<details>
    <summary>${toLink(bookmark)}</summary>
    <p><a href="delete/${bookmark.uuid}">Delete</a></p>
</details>`;

const urlToBookmark = (url) => {
    return {
        uuid: crypto.randomUUID(),
        url: url.searchParams.get("u"),
        title: url.searchParams.get("t"),
        createdAt: Date.now()
    }
}

const persist = (content, databaseFile) => {
    fs.writeFileSync(databaseFile, content, "utf-8");
}

const createBookmark = (request, response, dbFile) => {
    response.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });

    const url = toURL(request);

    const bookmark = urlToBookmark(url);

    if (bookmarks.every(entry => entry.url != bookmark.url)) {
        bookmarks.unshift(bookmark);
        const database =
            JSON.stringify({ bookmarks: bookmarks }, null, "\t");
        persist(database, dbFile);
    }

    response.end(websiteTemplate(added(bookmark), bookmark.url));
}

const getBookmarks = (response) => {
    response.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });

    const items =
        bookmarks.map((bookmark) => toDetails(bookmark)).join("\n");

    response.end(websiteTemplate(items))
}

const deleteBookmark = (request, response, dbFile) => {
    response.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
    const [, , id] = request.url.split("/");

    bookmarks = bookmarks.filter(bookmark => bookmark.uuid !== id);
    const database = JSON.stringify({ bookmarks: bookmarks }, null, "\t");
    persist(database, dbFile);

    response.end(websiteTemplate(`Bookmark ${id} deleted.`));
}

const toURL = (request) => new URL(request.url, `http://${request.headers.host}`);        

const server = (dbFile) => http.createServer((request, response) => {   
    let url = toURL(request);
    if (url.pathname == "/add") {
        createBookmark(request, response, dbFile);
    } else if (url.pathname.startsWith("/delete/")) {
        deleteBookmark(request, response, dbFile)
    } else {
        getBookmarks(response);
    }
});

const [, , dbFile, port] = process.argv;
const DEFAULT_FILE = "bookmarks.json";
const DEFAULT_PORT = 4711;
const file = dbFile || DEFAULT_FILE;
const initialState = fs.readFileSync(file, "utf-8");

let {bookmarks} = JSON.parse(initialState);

server(file).listen(port || DEFAULT_PORT);