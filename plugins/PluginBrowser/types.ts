export interface PluginAuthor {
  discordID?: string;
  github?: string;
  name?: string;
}

export interface Plugin {
  author: PluginAuthor;
  description?: string;
  id: string;
  image?: string;
  license?: string;
  name: string;
  plaintextPatches?: string;
  renderer?: string;
  source?: string;
  type?: string;
  updater?: {
    id: string;
    type: "github" | "store";
  };
  version: string;
}

export interface PageFetchData {
  numPages: number;
  page: number;
  results: Plugin[];
}

export interface PageFetchError {
  error: string;
}

export type PluginPage = PageFetchData | PageFetchError;
