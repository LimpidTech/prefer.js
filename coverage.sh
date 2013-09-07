#!/usr/bin/env sh

make &&
mocha --require coverage.js -R html-cov > coverage.html &&
make clean_coverage_sources
