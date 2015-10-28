#!/bin/bash

mkdir -p dist
rm -rf dist/*
mkdir dist/js
mkdir dist/css
mkdir dist/shaders

cp app/*.html dist/
cp app/css/*.css dist/css/
cp app/js/bundle.js dist/js/
cp app/shaders/* dist/shaders/
