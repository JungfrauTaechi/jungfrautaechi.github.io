import { spawnSync } from "node:child_process";

const run = (command, args, { capture = false } = {}) => {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = capture ? (result.stderr || result.stdout || "").trim() : "";
    throw new Error(`${command} ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`);
  }

  return capture ? result.stdout.trim() : "";
};

const pause = (milliseconds) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
};

run("gh", ["--version"], { capture: true });

const branch = run("git", ["branch", "--show-current"], { capture: true });
if (branch !== "main") throw new Error(`Pages can only be published from main; current branch is ${branch || "detached HEAD"}.`);

const headSha = run("git", ["rev-parse", "HEAD"], { capture: true });
run("git", ["push", "origin", "main"]);

let matchingRun = null;
for (let attempt = 0; attempt < 7 && !matchingRun; attempt += 1) {
  if (attempt > 0) pause(5_000);
  const output = run("gh", [
    "run", "list",
    "--workflow", "pages.yml",
    "--commit", headSha,
    "--limit", "1",
    "--json", "url,status,conclusion,event,headSha",
  ], { capture: true });
  matchingRun = JSON.parse(output)[0] || null;
}

if (matchingRun) {
  console.log(`Pages workflow already enqueued (${matchingRun.event}, ${matchingRun.status}): ${matchingRun.url}`);
} else {
  const workflowUrl = run("gh", ["workflow", "run", "pages.yml", "--ref", "main"], { capture: true });
  console.log(`No push-triggered workflow appeared; dispatched the Pages workflow: ${workflowUrl}`);
}
