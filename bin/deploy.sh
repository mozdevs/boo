git checkout -B gh-pages && \
npm run dist && \
git add dist && \
git commit && \
git subtree push --prefix dist origin gh-pages && \
git checkout master
