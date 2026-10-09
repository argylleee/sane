// Pure selection of the allocations a role should open worktrees for.
export function selectTasks(config, { id, role }) {
  const tasks = (config.tasks ?? []).filter(
    (task) => task.mode === 'write' && task.status === 'active',
  );
  if (id) {
    const task = tasks.find((candidate) => candidate.id === id);
    if (!task) throw new Error(`${id} is not an active write allocation in the registry.`);
    return [task];
  }
  if (!role) throw new Error('Pass --task ID or --role ROLE.');
  return tasks.filter((task) => task.role === role);
}
