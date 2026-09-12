const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");

// Two concurrent calls could otherwise both read the same "last" entry
// before either had saved, forking the hash chain (both children claiming
// the same prevHash). This app runs as a single Node process, so an
// in-process queue is sufficient to make read-last -> compute -> write
// atomic across concurrent callers, without needing a DB-level transaction.
let writeQueue = Promise.resolve();

async function appendEntry({
  action,
  actorId,
  actorRole,
  targetEntity,
  targetId,
  previousSnapshot,
  newSnapshot,
}) {
  const last = await AuditLog.findOne().sort({ _id: -1 });
  const prevHash = last ? last.hash : "GENESIS_HASH";

  const hash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({ action, actorId, targetEntity, targetId, previousSnapshot, newSnapshot, prevHash })
    )
    .digest("hex");

  return AuditLog.create({
    action,
    actorId,
    actorRole,
    targetEntity,
    targetId,
    previousSnapshot,
    newSnapshot,
    hash,
    prevHash,
  });
}

function logAction(params) {
  const task = writeQueue.then(() => appendEntry(params));
  // Keep the queue alive even if this particular write fails, so one bad
  // entry doesn't permanently stall every audit log after it.
  writeQueue = task.then(
    () => undefined,
    () => undefined
  );
  return task;
}

module.exports = { logAction };
