export function joinBasePath(base, path) {
  if (!base) base = '';
  if (!path) path = '';
  // ensure base ends with a single slash
  if (!base.endsWith('/')) base = base + '/';
  // remove leading slash from path to avoid double slashes
  while (path.startsWith('/')) {
    path = path.substring(1);
  }
  return base + path;
}

export default { joinBasePath };
