.PHONY: build
build:
	CGO_ENABLED=0 GOBIN=`pwd`/bin go install -mod=vendor \
	./cmd/...

.PHONY: docker-amd64
docker-amd64:
	docker build --platform linux/amd64 -t weather-publisher:local-amd64-2 .