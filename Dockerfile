FROM golang:1.19-buster AS builder

WORKDIR /src


COPY Makefile Makefile
COPY go.mod go.mod
COPY cmd cmd
COPY vendor vendor

RUN make build

FROM alpine:3 AS user-and-certs

RUN apk add -U --no-cache ca-certificates

FROM scratch

COPY --from=user-and-certs /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /src/bin/* /bin/

ENTRYPOINT [ "/bin/publisher" ]