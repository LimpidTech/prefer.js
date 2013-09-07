CC=coffee
OUT=lib/prefer
COV_OUT=coverage.js
IN=src/

all: prefer prefer_cov

prefer: ${OUT}
	${CC} -o "${OUT}" -c "${IN}"

prefer_cov:
	./node_modules/.bin/coffeeCoverage \
		--initfile "${COV_OUT}" \
		--path relative \
		"${IN}" "${IN}"

lib/prefer:
	mkdir -p "${OUT}"

clean: clean_coverage_sources
	rm -rf lib

clean_coverage_sources:
	find src -name \*.js -exec rm {} \;

.PHONY: prefer prever_cov clean clean_cov
