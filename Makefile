CC=coffee
IN=src

build_dir=build
dist_dir=lib

all: prefer coverage

prefer: ${dist_dir}/prefer

${dist_dir}/prefer: ${dist_dir}
	mkdir -p ${dist_dir}/prefer
	${CC} -o "$@" -c "${IN}"

coverage: ${build_dir}/coverage.js
	npx mocha \
		--require ${build_dir}/coverage.js \
		-R mocha-lcov-reporter | node_modules/.bin/coveralls
	make clean_coverage_sources

${build_dir}/coverage.js: ${build_dir}
	node_modules/.bin/coffeeCoverage \
		--initfile "$@" \
		--path relative \
		"${IN}" "${IN}"

${build_dir}:
	mkdir $@

${dist_dir}:
	mkdir -p ${dist_dir}

clean: clean_coverage_sources
	rm -rf "${build_dir}" "${dist_dir}"

clean_coverage_sources:
	find src -name \*.js -exec rm {} \;

.PHONY: all prefer coverage prefer ${build_dir}/*
