#!/usr/bin/env bash
./gnome-shell-extension-tool.py -l | cut -d ':' -f 1 | xargs -n1 -i ./gnome-shell-extension-tool.py -e '{}'
