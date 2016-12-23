# Simple isomorphic riot app

## Philosophy

Use mostly your mind and only the tools your app really needs: riot allows you doing both things!

## Info

This app is really simple and it may not be perfect because I have coded it in a couple of days but it's enough to answer to the following FAQ:

  - How can I render riot components on the server?
  - How can I dispatch events across several riot components?
  - How can I store/manage my data state?
  - How can I share the same router paths on the client and on the server?
  - How can I create a bundle file building my riot tags for my production app?
  - How can I use es6 with my riot tags?

## Setup

```bash
$ npm install
```

## Run

```bash
$ npm start
```

## Develop

```bash
$ npm run watch # watch the client js files
$ npm run watch-server # watch the server js files
```

## TODO

- Simplify the app logic that at moment is a bit too complicate for what it does
- Use always immutable data avoiding manipulating objects
- Implement redux like events api
