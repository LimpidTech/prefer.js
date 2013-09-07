#!/usr/bin/env sh

make &&
mocha --require lib-cov/init.js -R html-cov > lib-cov/coverage.html &&
make clean_coverage_sources
