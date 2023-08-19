#!/usr/bin/env bash

set -eou pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIRECTORY="${DIR%/*}"
cd "$PARENT_DIRECTORY"

# Se deben cargar antes de ejecutar los test, no es posible usar beforeAll in jest
# para cargar o cambiar estas varibles ya que se cargan y setean el context
# en el momento de realizar el import de la librería ->  import * as github from '@actions/github';

# El context: es un event sync en una pull_request, este evento se encuentra detallado
# en test/utils/prSynchronizeEvent.json

export GITHUB_EVENT_PATH="$PARENT_DIRECTORY/test/utils/prSynchronizeEvent.json"
export GITHUB_EVENT_NAME="pull_request"

# Execute the command with the environment variables set
"$@"
