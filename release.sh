#!/usr/bin/env bash

set -e

rm -rf dist
yarn build

cd dist
touch .nojekyll

git init
git remote add origin git@github.com:phyng/pnetview.git
git add .
git commit -m 'chore(build)'
git branch -m gh-pages
git push origin gh-pages -f
