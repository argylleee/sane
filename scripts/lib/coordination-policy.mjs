export const roles = ['integration', 'frontend', 'backend'];
const states = ['planned', 'active', 'blocked', 'ready', 'integrated', 'cancelled'];
const heldStates = new Set(['active', 'blocked', 'ready']);

export function held(task) {
  return task.mode === 'write' && heldStates.has(task.status);
}

export function validScope(path) {
  return (
    typeof path === 'string' &&
    path.length > 0 &&
    path.length <= 512 &&
    !path.startsWith('/') &&
    !['\\', ':', '*', '?', '[', ']'].some((character) => path.includes(character)) &&
    ![...path].some((character) => character.codePointAt(0) < 32) &&
    !path
      .replace(/\/$/, '')
      .split('/')
      .some((part) => !part || part === '.' || part === '..') &&
    !['.git', '.worktrees', '.local', 'node_modules'].some(
      (name) => path.toLowerCase() === name || path.toLowerCase().startsWith(`${name}/`),
    )
  );
}

export function covers(scope, path) {
  return scope.endsWith('/') ? path.startsWith(scope) : scope === path;
}

export function overlaps(a, b) {
  const first = a.replace(/\/$/, '');
  const second = b.replace(/\/$/, '');
  return first === second || first.startsWith(`${second}/`) || second.startsWith(`${first}/`);
}

export function assertCoordination(config) {
  if (config.version !== 1 || !Array.isArray(config.sharedPaths) || !Array.isArray(config.tasks))
    throw new Error('Invalid coordination registry shape.');
  for (const path of config.sharedPaths)
    if (!validScope(path)) throw new Error(`Invalid shared scope: ${path}`);
  const ids = new Set();
  for (const task of config.tasks) {
    if (!/^[A-Z][A-Z0-9-]{1,63}$/.test(task.id ?? '') || ids.has(task.id))
      throw new Error('Invalid or duplicate task ID.');
    ids.add(task.id);
    if (
      !roles.includes(task.role) ||
      !states.includes(task.status) ||
      !['read', 'write'].includes(task.mode) ||
      typeof task.owner !== 'string' ||
      !task.owner.trim() ||
      !Number.isSafeInteger(task.allocation) ||
      task.allocation < 1
    )
      throw new Error(`Invalid identity/state/allocation for ${task.id}.`);
    if (![task.allowedPaths, task.writeResources, task.dependsOn].every(Array.isArray))
      throw new Error(`Missing scopes/resources/dependencies for ${task.id}.`);
    for (const path of task.allowedPaths) {
      if (!validScope(path)) throw new Error(`Invalid scope for ${task.id}: ${path}`);
      if (
        task.role !== 'integration' &&
        config.sharedPaths.some((shared) => overlaps(path.toLowerCase(), shared.toLowerCase()))
      )
        throw new Error(`${task.id}: shared files require integration ownership (${path}).`);
    }
    if (task.mode === 'read' && (task.allowedPaths.length || task.writeResources.length))
      throw new Error(`${task.id}: read-only tasks cannot reserve writes.`);
    if (task.mode === 'write' && !task.allowedPaths.length && !task.writeResources.length)
      throw new Error(`${task.id}: write task needs a file or external-resource scope.`);
    for (const resource of task.writeResources) {
      if (typeof resource !== 'string' || !/^[a-z0-9][a-z0-9:/._-]{0,255}$/.test(resource))
        throw new Error(`${task.id}: invalid resource key; use a non-secret lowercase identifier.`);
    }
    if (held(task)) {
      if (
        typeof task.branch !== 'string' ||
        !task.branch.trim() ||
        typeof task.worktree !== 'string' ||
        !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(task.worktree) ||
        !/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/.test(task.baseRevision ?? '')
      )
        throw new Error(
          `${task.id}: reserved writes need branch, worktree, and full base revision.`,
        );
      if (!(task.role === 'integration' && task.branch === 'main')) assertBranch(task.branch);
    }
  }
  const byId = new Map(config.tasks.map((task) => [task.id, task]));
  for (const task of config.tasks) {
    for (const id of task.dependsOn)
      if (!byId.has(id) || id === task.id)
        throw new Error(`${task.id}: unknown or self dependency.`);
    if (
      task.status === 'active' &&
      task.dependsOn.some((id) => byId.get(id).status !== 'integrated')
    )
      throw new Error(`${task.id}: prerequisites are not integrated.`);
  }
  const visited = new Set();
  const visiting = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error(`Dependency cycle at ${id}.`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of byId.get(id).dependsOn) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids) visit(id);
  const claims = config.tasks.filter(held);
  for (let i = 0; i < claims.length; i++) {
    for (const other of claims.slice(i + 1)) {
      const task = claims[i];
      if (
        task.branch.toLowerCase() === other.branch.toLowerCase() ||
        task.worktree === other.worktree
      )
        throw new Error(`${task.id}/${other.id}: writing tasks cannot share branch/worktree.`);
      if (
        task.allowedPaths.some((a) =>
          other.allowedPaths.some((b) => overlaps(a.toLowerCase(), b.toLowerCase())),
        )
      )
        throw new Error(`${task.id}/${other.id}: overlapping file ownership.`);
      if (task.writeResources.some((resource) => other.writeResources.includes(resource)))
        throw new Error(`${task.id}/${other.id}: overlapping external/interface write resource.`);
    }
  }
  return config;
}

export function assertTaskScope(config, id, allocation, files) {
  assertCoordination(config);
  const task = config.tasks.find((entry) => entry.id === id);
  if (!task || task.status !== 'active' || task.mode !== 'write')
    throw new Error('Task is not an active writing allocation.');
  if (task.allocation !== allocation)
    throw new Error('Stale task allocation. Refresh the coordinator receipt.');
  const escaped = files.filter((file) => !task.allowedPaths.some((scope) => covers(scope, file)));
  if (escaped.length) throw new Error(`Outside ${id} ownership: ${escaped.join(', ')}`);
  return task;
}
import { assertBranch } from './git-conventions.mjs';
