CC=coffee
IN=src

build_dir=build
dist_dir=lib

all: ${OUT} coverage

${dist_dir}/prefer: ${dist_dir}
	mkdir ${dist_dir}/prefer
	${CC} -o "${OUT}" -c "${IN}"

coverage: ${build_dir}/coverage.html

${build_dir}/coverage.html: ${build_dir}/coverage.js
	mocha --require ${build_dir}/coverage.js -R html-cov > $@
	make clean_coverage_sources

${build_dir}/coverage.js: ${build_dir} 
	./node_modules/.bin/coffeeCoverage \
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

.PHONY: prefer prever_cov clean clean_coverage_sources
