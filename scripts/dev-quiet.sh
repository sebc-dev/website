#!/bin/bash

# Script pour lancer le serveur de dev en filtrant les warnings Durable Objects
# Ces warnings sont attendus en local (les DO fonctionnent en production)
# Voir: https://opennext.js.org/cloudflare/known-issues

# Enable pipefail to propagate errors through the pipe
# Without this, if 'pnpm dev' fails, the script would still exit with code 0
set -o pipefail

pnpm dev 2>&1 | grep -v \
  -e "You have defined bindings to the following internal Durable Objects:" \
  -e "These will not work in local development" \
  -e "workerd/server/server.c++:1952: warning: A DurableObjectNamespace" \
  -e "but no such Durable Object class is exported from the worker" \
  -e "For detailed instructions, refer to the Durable Objects section here:"
