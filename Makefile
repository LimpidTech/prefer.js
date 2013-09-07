CC=coffee
OUT=lib/prefer
COV_OUT=lib-cov/prefer
IN=src/

all: prefer prefer_cov

prefer: ${OUT}
	${CC} -o "${OUT}" -c "${IN}"

prefer_cov: ${COV_OUT}
	./node_modules/.bin/coffeeCoverage \
		--initfile "${COV_OUT}/coverage.js" \
		"${IN}" "${COV_OUT}"

lib/prefer:
	mkdir -p "${OUT}"

lib-cov/prefer:
	mkdir -p $@

clean: clean_cov
	rm -rf lib lib-cov

.PHONY: prefer prever_cov clean clean_cov
