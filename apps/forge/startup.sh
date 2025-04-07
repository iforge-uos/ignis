#!/bin/sh
echo "Starting Forge frontend with Nginx $(nginx -v 2>&1 | cut -d '/' -f 2)"
nginx -g 'daemon off;' 