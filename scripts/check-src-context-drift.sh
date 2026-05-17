#!/bin/sh
# pk-doctor drift check stub for derived projects.
#
# In processkit's own development repo, this script diffs the canonical
# src/context/ schemas against the live context/ instantiation and exits
# non-zero on drift. Derived projects (like this one) have no src/context/
# tree — their context/ is the only instantiation — so there is nothing
# to drift from.
#
# pk-doctor invokes this from the repo root and treats exit 0 as
# "trees in sync". Keep the stub so the check passes cleanly here.

if [ -d "src/context" ]; then
  echo "src/context exists but no real drift logic shipped to derived projects." >&2
  echo "Install processkit's release-time scripts before relying on this check." >&2
  exit 1
fi

echo "trees in sync (derived project: no src/context/ to drift from)"
exit 0
