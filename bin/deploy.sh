#!/bin/bash

mkdir -p dist
rm -rf dist/*
mkdir dist/js
mkdir dist/css

cp app/*.html dist/
cp app/css/*.css dist/css/
cp app/js/bundle.js dist/js/
