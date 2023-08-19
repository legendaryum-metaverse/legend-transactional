#!/bin/bash
# Set script to exit on error, unset variables, and fail pipes
set -eou pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIRECTORY="${DIR%/*}"
cd "$PARENT_DIRECTORY"

declare -a directories=("node_modules" "dist" ".turbo" "coverage")

clean_directories() {
  local dir
  for dir in "${directories[@]}"; do
    # Find and remove directories with the given name
    find . -name "$dir" -type d -prune -exec rm -rf '{}' +
    # Print a green checkmark after cleaning the folder
    echo -e "\033[32m \xE2\x9C\x94\033[0m \033[95m\x1B[3m$dir\x1B[0m \033[3mcleaned\x1B[0m"
  done
}

clean_directories
