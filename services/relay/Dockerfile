FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY main.go relay_test.go ./
RUN go test ./... && CGO_ENABLED=0 go build -o /relay .

FROM alpine:3.21
RUN adduser -D -u 10001 relay
USER relay
COPY --from=build /relay /usr/local/bin/relay
EXPOSE 9119
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:9119/healthz || exit 1
ENTRYPOINT ["/usr/local/bin/relay"]
