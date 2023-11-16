import { PluginPage } from "./types";

const API_URL = "https://replugged.dev/api/store/list/plugin";

const cachedPages: PluginPage[] = [];

export async function getPlugins(
  page: number,
  query = "",
  items = 12,
  cache = true,
): Promise<PluginPage | null> {
  if (cache && !query.length) {
    if (cachedPages[page]) return cachedPages[page];
  }
  try {
    const plugins = await fetch(`${API_URL}?page=${page}&items=${items}&query=${query}`).then(
      (thing) => thing.json(),
    );
    if (cache && !query.length && !plugins.error) cachedPages[page] = plugins;
    return plugins;
  } catch {
    // Only in case of network errors (e.g. the current user does not have a stable internet connection)
    return null;
  }
}

export async function getAllPluginIds(): Promise<string[] | null> {
  const plugins = [];
  let page = 1;
  let done = false;
  let iterations = 0;
  while (!done) {
    if (iterations > 10) return null;
    iterations++;
    let f = await getPlugins(page, "", 100, false);
    if (!f || "error" in f) {
      await new Promise((res) => setTimeout(res, 2000));
      continue;
    }
    plugins.push(f);
    if (f.numPages > f.page) {
      page++;
      continue;
    }
    done = true;
  }
  return plugins.flatMap((plugin) => plugin.results.map((result) => result.id));
}
