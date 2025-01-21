import path from "path";

export function getImportsDirectory(subpath: string, env?: string): string {
  let importsDir = path.resolve(subpath);
  if (env) {
    const localEnvPath = path.resolve(env);
    importsDir = path.resolve(localEnvPath, subpath);
  }
  return importsDir;
}
