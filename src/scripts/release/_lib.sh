# Shared helpers for src/scripts/release/phaseN-*.sh
# Sourced, not executed. No `set -e` here — the caller controls that.

# REPO_ROOT must be set by the caller before sourcing (the orchestrator
# sets it, and standalone phase invocations resolve it from $0).

log_ok()   { printf "  [ok]   %s\n" "$*"; }
log_fail() { printf "  [FAIL] %s\n" "$*" >&2; }
log_info() { printf "  [info] %s\n" "$*"; }
log_warn() { printf "  [warn] %s\n" "$*"; }

# Write evidence file under dist/release-evidence/ — gitignored.
ensure_evidence_dir() {
  : "${REPO_ROOT:?REPO_ROOT must be set before sourcing _lib.sh}"
  mkdir -p "$REPO_ROOT/dist/release-evidence"
  printf '%s' "$REPO_ROOT/dist/release-evidence"
}

# True if running interactively (TTY attached) and RELEASE_NONINTERACTIVE
# is not set. Phase scripts that need a manual y/N use this to short-circuit
# in CI / agent contexts.
is_interactive() {
  [ -t 0 ] && [ "${RELEASE_NONINTERACTIVE:-0}" != "1" ]
}

# Confirm a manual step. Usage: confirm "Did the smoke test pass?"
# Returns 0 on yes, 1 otherwise. In non-interactive mode, returns 0
# only when RELEASE_AUTO_CONFIRM=1 (explicit opt-in).
confirm() {
  local prompt="$1"
  if ! is_interactive; then
    if [ "${RELEASE_AUTO_CONFIRM:-0}" = "1" ]; then
      log_info "auto-confirmed (RELEASE_AUTO_CONFIRM=1): $prompt"
      return 0
    fi
    log_fail "manual step would block (non-interactive): $prompt"
    log_fail "set RELEASE_AUTO_CONFIRM=1 to skip prompts, or run interactively"
    return 1
  fi
  local resp
  read -r -p "  $prompt [y/N] " resp
  case "$resp" in y|Y|yes|YES) return 0 ;; *) return 1 ;; esac
}
