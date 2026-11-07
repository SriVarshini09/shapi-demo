package main

import (
	"net/http"
	"strings"
)

func main() {
	http.Post("https://api.github.com/repos/acme/web/actions/workflows/ci.yml/dispatches", "application/json", strings.NewReader(`{"ref":"main"}`))
}
