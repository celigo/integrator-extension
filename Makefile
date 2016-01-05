MOCHA_COV=./node_modules/.bin/_mocha
MOCHA=./node_modules/.bin/mocha

ENVIRONMENT_VARIABLES = NODE_ENV=unittest

test:
	@$(ENVIRONMENT_VARIABLES) \
	$(MOCHA) test

debug:
	@$(ENVIRONMENT_VARIABLES) \
	$(MOCHA) --debug-brk test

.PHONY: test debug
