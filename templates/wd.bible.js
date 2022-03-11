const HTMLParser = require('node-html-parser');
const fetch = require('node-fetch');
const mkdirp = require('mkdirp');
const fs = require('fs');

fetch('https://wd.bible/bible/books/cnvs')
  .then(res => res.text())
  .then(text => main(JSON.parse(text)));

let ups = [];

function main(data) {
  fetchBooks(data.data[0], data.data[0].canon);
  fetchBooks(data.data[1], data.data[1].canon);
  fetchurls();
}

function fetchVerse(chapter, path) {
  const root = HTMLParser.parse(chapter);
  let fsc = [];
  root.querySelectorAll('h5,div.v').forEach((e) => fsc.push(e.structuredText));
  let raw = fsc.join('\n');
  fs.writeFile(path, raw, err => {if (err) console.log(err);});
  console.log(raw);
}

function fetchurls() {
  let len = ups.length > 6 ? 6 : ups.length;
  for (let i = 0; i < len; i++) {
    let path = ups[0].path;
    fetch(ups[0].url)
      .then(res => res.text())
      .then(text => fetchVerse(text, path));
    ups.shift();
  }
  if (ups.length > 0) {
    setTimeout(fetchurls, 1000);
  }
}

function fetchBooks(data, path) {
  mkdirp(path);
  data.booksList.forEach(book => fetchBook(book, path));
}

function fetchBook(book, path) {
  const bn = book.bookUsfm.toLowerCase();
  mkdirp(path + '/' + bn);
  for (let i = 1; i <= book.bookChapterMaxNumber; i++) {
    ups.push({url:'https://wd.bible/' + bn + '.' + i + '.cnvs', path: path + '/' + bn + '/' + i});
  }
}
