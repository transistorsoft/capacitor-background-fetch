#!/usr/bin/env bash
# Everything worth checking before a release — run by scripts/release.sh and by the
# release workflow, and safe to run any time.
#
#   scripts/preflight.sh             build, pack, and compile a consumer against the tarball
#   scripts/preflight.sh --release   also: CHANGELOG has a heading for this version
#
# dist/ is not tracked, so a hand `npm publish` ships whatever was built last; and the
# `files` list decides the rest (8.1.3 shipped without the proguard-rules.pro its
# build.gradle names, and broke Android builds). This checks the PACKED tarball from a clean
# build, from a consumer's side. It builds into throwaway directories and publishes nothing;
# it reads the registry only to compare file lists.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
RELEASE=0
[ "${1:-}" = "--release" ] && RELEASE=1

GREEN=$'\033[0;32m'; RED=$'\033[0;31m'; DIM=$'\033[2m'; RESET=$'\033[0m'
ok()   { echo "  ${GREEN}✓${RESET} $1"; }
fail() { echo "  ${RED}✗${RESET} $1" >&2; exit 1; }
step() { echo; echo "${DIM}── $1${RESET}"; }

cd "$ROOT"
NAME="$(node -p "require('./package.json').name")"
VERSION="$(node -p "require('./package.json').version")"

step "1. version"
echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$' || fail "package.json version '$VERSION' is not semver"
if [ "$RELEASE" = 1 ]; then
  # The first `## ` heading must be this version: an `## Unreleased` above it means the
  # notes were never given a version.
  first="$(grep -m1 '^## ' CHANGELOG.md || true)"
  case "$first" in
    "## $VERSION "*|"## [$VERSION] "*) ok "$NAME@$VERSION — CHANGELOG: $first" ;;
    *) fail "CHANGELOG's first heading is '$first', not '## [$VERSION] …' — run npm run release -- prepare" ;;
  esac
else
  ok "$NAME@$VERSION"
fi

step "2. clean build"
npm run -s build >"$WORK/build.log" 2>&1 || { cat "$WORK/build.log" >&2; fail "npm run build (clean, tsc, rollup)"; }
ok "dist/ rebuilt from src/ alone"

step "3. the tarball"
# Its own directory: the version on npm, packed below, has the same file name whenever
# package.json still says the released version, and would overwrite this one, so step 4
# would install and test what is already on npm instead of this build.
mkdir -p "$WORK/pack" "$WORK/npm"
npm pack --silent --pack-destination "$WORK/pack" >/dev/null || fail "npm pack"
TARBALL="$(ls "$WORK"/pack/*.tgz)"
tar -tzf "$TARBALL" | sort > "$WORK/contents"
# What a Capacitor app needs from the package: the web entries package.json names, the
# typings, and the native halves for both build systems on each OS — including the
# proguard-rules.pro that android/build.gradle names.
for want in package/package.json package/dist/plugin.cjs.js package/dist/esm/index.js package/dist/esm/index.d.ts \
            package/dist/plugin.js package/android/build.gradle package/android/proguard-rules.pro \
            package/TransistorsoftCapacitorBackgroundFetch.podspec package/Package.swift; do
  grep -qx "$want" "$WORK/contents" || fail "the tarball has no $want"
done
grep -q '^package/android/src/main/' "$WORK/contents" || fail "the tarball has no android/src/main/"
grep -q '^package/ios/Sources/' "$WORK/contents" || fail "the tarball has no ios/Sources/"
bad="$(grep -E '^package/(src|example|scripts|help|docs|node_modules|\.github|\.swiftpm)/|/\.gradle/|^package/RELEASING\.md$' "$WORK/contents" || true)"
[ -z "$bad" ] || fail "the tarball carries what it should not: $(echo "$bad" | head -3 | tr '\n' ' ')"
ok "$(basename "$TARBALL") — $(wc -l < "$WORK/contents" | tr -d ' ') files"
# Against the version on npm now: files that vanish or appear are worth a look before
# they ship. Printed, not enforced — a deliberate change is fine.
PREV="$(npm view "$NAME" dist-tags.latest 2>/dev/null || true)"
if [ -n "$PREV" ] && (cd "$WORK/npm" && npm pack --silent "$NAME@$PREV" >/dev/null 2>&1); then
  tar -tzf "$WORK"/npm/*.tgz | sort > "$WORK/previous"
  gone="$(comm -23 "$WORK/previous" "$WORK/contents" | sed 's#^package/##')"
  new="$(comm -13 "$WORK/previous" "$WORK/contents" | sed 's#^package/##')"
  ok "against $PREV on npm: $(echo -n "$gone" | grep -c . || true) gone, $(echo -n "$new" | grep -c . || true) new"
  [ -z "$gone" ] || echo "$gone" | head -10 | sed 's/^/      - /'
  [ -z "$new" ] || echo "$new" | head -10 | sed 's/^/      + /'
else
  echo "  ${DIM}(no published version to compare with)${RESET}"
fi

step "4. a consumer compiles and runs against it"
# @capacitor/core is the peer the typings import; the types package comes in as a dependency.
# The repo's own TypeScript (4.1) predates node16 and bundler resolution: the consumer
# brings its own.
mkdir -p "$WORK/consumer" && cd "$WORK/consumer"
echo '{"name": "consumer", "private": true}' > package.json
CORE="$(node -p "require('$ROOT/package.json').peerDependencies['@capacitor/core']")"
npm install --silent --no-audit --no-fund "$TARBALL" "@capacitor/core@$CORE" "typescript@^5" >/dev/null \
  || fail "npm install of the tarball with @capacitor/core@$CORE"
cat > index.ts <<'TS'
import { BackgroundFetch } from "@transistorsoft/capacitor-background-fetch";
import type { BackgroundFetchConfig, BackgroundFetchStatus, TaskConfig } from "@transistorsoft/capacitor-background-fetch";
import type TypesBackgroundFetch from "@transistorsoft/background-fetch-types";

// (WO-006) Capacitor's BackgroundFetch is its own class, compiled from src/index.ts, so nothing else holds it to the
// shared types' class.  This holds every member Capacitor has to the types' declaration of it; registerHeadlessTask
// is absent by design (Capacitor's headless task is Java-only).  Parameter lists are checked only loosely by an
// assignment: the calls below cover configure, scheduleTask and stop.
export const conforms: Pick<typeof TypesBackgroundFetch,
  | "STATUS_RESTRICTED" | "STATUS_DENIED" | "STATUS_AVAILABLE"
  | "NETWORK_TYPE_NONE" | "NETWORK_TYPE_ANY" | "NETWORK_TYPE_UNMETERED" | "NETWORK_TYPE_NOT_ROAMING" | "NETWORK_TYPE_CELLULAR"
  | "configure" | "scheduleTask" | "start" | "stop" | "finish" | "status"> = BackgroundFetch;

const config: BackgroundFetchConfig = {
  minimumFetchInterval: 15,
  stopOnTerminate: false,
  requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
};
export async function start(): Promise<boolean> {
  const status: BackgroundFetchStatus = await BackgroundFetch.configure(
    config,
    async (taskId: string) => BackgroundFetch.finish(taskId),
    async (taskId: string) => BackgroundFetch.finish(taskId),
  );
  const task: TaskConfig = { taskId: "com.transistorsoft.task", delay: 5000, periodic: false };
  // (WO-006) The types declare both Promise<boolean>.
  const scheduled: boolean = await BackgroundFetch.scheduleTask(task);
  const stoppedTask: boolean = await BackgroundFetch.stop(task.taskId);
  const stoppedAll: boolean = await BackgroundFetch.stop();
  return status === BackgroundFetch.STATUS_AVAILABLE && scheduled && stoppedTask && stoppedAll;
}
TS
for mode in "node16 node16" "esnext bundler"; do
  set -- $mode
  ./node_modules/.bin/tsc --strict --noEmit --skipLibCheck false --target es2020 --lib es2020,dom \
    --module "$1" --moduleResolution "$2" index.ts \
    || fail "a strict consumer does not compile under moduleResolution $2"
done
ok "strict TypeScript compiles under node16 and bundler resolution"
# The constants are getters on the class: they must hold their values at runtime, not only type-check.
node -e '
  const { BackgroundFetch: B } = require("@transistorsoft/capacitor-background-fetch");
  if (typeof B !== "function" || typeof B.configure !== "function") { console.error("no BackgroundFetch export"); process.exit(1); }
  const want = { STATUS_RESTRICTED: 0, STATUS_DENIED: 1, STATUS_AVAILABLE: 2, NETWORK_TYPE_NONE: 0,
                 NETWORK_TYPE_ANY: 1, NETWORK_TYPE_UNMETERED: 2, NETWORK_TYPE_NOT_ROAMING: 3, NETWORK_TYPE_CELLULAR: 4 };
  const wrong = Object.keys(want).filter(k => B[k] !== want[k]);
  if (wrong.length) { console.error("wrong at runtime:", wrong.join(", ")); process.exit(1); }' \
  || fail "require() does not return BackgroundFetch with its constants"
ok "require() returns BackgroundFetch with every constant"

echo
echo "${GREEN}preflight passed${RESET} — $NAME@$VERSION"
