#!/bin/sh
METHOD="$1"
curl -X "$METHOD" https://api.github.com/repos/acme/web/issues
