CC=coffee
OUT=lib/prefer
COV_OUT=src
IN=src/

all: prefer prefer_cov

prefer: ${OUT}
	${CC} -o "${OUT}" -c "${IN}"

prefer_cov: lib-cov
	./node_modules/.bin/coffeeCoverage \
		--initfile "lib-cov/init.js" \
		--path relative \
		"${IN}" "${COV_OUT}"

lib/prefer:
	mkdir -p "${OUT}"

lib-cov:
	mkdir lib-cov

clean: clean_coverage_sources
	rm -rf lib lib-cov

clean_coverage_sources:
	find src -name \*.js -exec rm {} \;

.PHONY: prefer prever_cov clean clean_cov
