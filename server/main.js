require('isomorphic-fetch');
const express = require("express");
const nextjs = require("next");
const LRUCache = require('lru-cache')
const { parse } = require("url");

const PORT = process.env.PORT || 4000;
const dev = process.env.NODE_ENV !== "production";
const app = nextjs({ dev });

const handle = app.getRequestHandler();

// This is where we cache our rendered HTML pages
const ssrCache = new LRUCache({
  max: 100, // 100 pages in cache
  maxAge: 1000 * 60 // 1 minute
});

function getCacheKey (req) {
  return `${req.url}`
}

function getSongLyrics(path) {
    const artist = path.substr(1);
    const artistFullName = {
        beatles: "The Beatles",
        metallica: "Metallica",
        oasis: "Oasis"
    };
    const songByArtists = {
        beatles: ["Strawberry fields forever", "Hey jude"],
        metallica: ["One", "Master of puppets"],
        oasis: ["Supersonic", "Champagne Supernova"]
    };

    const artistToFetch = artistFullName[artist];
    const songsToFetch = songByArtists[artist];
    const urlsToFetch = songsToFetch && songsToFetch.map(song => `https://api.lyrics.ovh/v1/${artistToFetch}/${song}`);

    return urlsToFetch;
}

async function renderAndCache(req, res, next) {
  const key = getCacheKey(req)

  // If we have a page in the cache, let's serve it
  if (ssrCache.has(key)) {
    console.log("from cache !!")
    res.setHeader("x-cache", "HIT");
    res.send(ssrCache.get(key))
    return
  }

  try {
    const requestPath = req.originalUrl;
    const lyricsToFetch = getSongLyrics(requestPath);
    const songs = lyricsToFetch ?
      await Promise.all(lyricsToFetch.map(url =>
          fetch(url).then(resp => resp.text())
      )) :  [];
    req.pageData = songs;
    // console.log({songs});
    const html = await app.renderToHTML(req, res, "/", req.query);

    res.setHeader('x-cache', 'MISS')
    res.send(html)
    ssrCache.set(requestPath, html)
  } catch (err) {
    console.error(err);
    // app.renderError(err, req, res, pagePath, queryParams)
  }
}

app.prepare().then(() => {
  const server = express();
  server.get("/health-check", (req, res) => {
    res.sendStatus(200);
  });
  server.get("/favicon.ico", (req, res) => res.sendStatus(404));

  server.get("*", (req, res, next) => {
    const parsedUrl = parse(req.url, true);

    if (req.originalUrl.lastIndexOf("/_next/", 0) === 0) {
      return handle(req, res, parsedUrl);
    }

    return renderAndCache(req, res, next);
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} - ${dev ? "DEV" : "PROD"}`);
  });
});
