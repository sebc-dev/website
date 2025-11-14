#!/bin/bash

# Script pour lancer le serveur de dev en filtrant les warnings Durable Objects
# Ces warnings sont attendus en local (les DO fonctionnent en production)
# Voir: https://opennext.js.org/cloudflare/known-issues

pnpm dev 2>&1 | grep -v \
  -e "You have defined bindings to the following internal Durable Objects:" \
  -e "These will not work in local development" \
  -e "workerd/server/server.c++:1952: warning: A DurableObjectNamespace" \
  -e "but no such Durable Object class is exported from the worker" \
  -e "For detailed instructions, refer to the Durable Objects section here:" \
  -e "NEXT_CACHE_DO_QUEUE" \
  -e "NEXT_TAG_CACHE_DO_SHARDED" \
  -e "NEXT_CACHE_DO_PURGE" \
  -e "DOQueueHandler" \
  -e "DOShardedTagCache" \
  -e "BucketCachePurge" \
  || true
