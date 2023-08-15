#!/bin/bash

set -eou pipefail
changeset_folder=".changeset"

# Check if the .changeset folder exists
if [ ! -d "$changeset_folder" ]; then
    echo "The .changeset folder does not exist."
    exit 1
fi

# Get a list of .md files (excluding README.md) in the .changeset folder
md_files=$(find "$changeset_folder" -name '*.md' ! -name 'README.md')

# Check if there are any .md files other than README.md
if [ -n "$md_files" ]; then
    echo "There are .md files other than README.md in the $changeset_folder folder:"
    echo "$md_files"
    exit 0
else
    echo "No .md files other than README.md found in the $changeset_folder folder."
    exit 1
fi
