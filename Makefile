.PHONY: install dev lint test build verify docker-up docker-down

install:
	npm install

dev:
	npm run dev

lint:
	npm run lint --if-present

test:
	npm test

build:
	npm run build

verify:
	npm run verify

docker-up:
	docker compose up --build

docker-down:
	docker compose down
