# Boo

MediaRecorder API demo.

## Development

### Build

This project uses Browserify, so you need to build `bundle.js`:

```
npm run build
```

To compile a distribution version, just run `dist`, which in turn will run `build`:

```
npm run dist
```

To watch files for changes and recompile, run `watch`:

```
npm run watch
```

### Deploy

Change to branch `gh-pages`, run `dist`, commit your changes, and then run `deploy`.

```
git checkout gh-pages
npm run dist
git add dist
git commit
npm run deploy
```

What `npm run deploy` is exactly a subtree push:

```
git subtree push --prefix dist origin gh-pages
```

**In case of conflicts**, run a subtree pull, solve the conflicts and then commit again.

```
git subtree pull --prefix dist origin gh-pages
```
