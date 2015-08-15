ifndef SystemRoot
	MOCHA_COV=./node_modules/.bin/_mocha
	MOCHA=./node_modules/.bin/mocha

	NODE_ENV=unittest
else
	MOCHA_COV=.\node_modules\.bin\_mocha
	MOCHA=.\node_modules\.bin\mocha

	NODE_ENV=unittest
endif

test:
	$(MOCHA) test

debug:
	$(MOCHA) --debug-brk test

.PHONY: test debug
