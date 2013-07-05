CC=coffee
OUT=lib/prefer
IN=src/

all: lib/prefer
	${CC} -o ${OUT} -c ${IN}

lib/prefer:
	mkdir -p "${OUT}"

