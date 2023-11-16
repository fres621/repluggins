/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injector, webpack } from "replugged";
import PluginBrowser from "./PluginBrowser";
const inject = new Injector();

const mod = await webpack.waitForModule<{
  default: {
    prototype: {
      getPredicateSections: (_: unknown) => any[];
    };
  };
}>(webpack.filters.bySource("getPredicateSections"));

export function start(): void {
  inject.after(mod.default.prototype, "getPredicateSections", (_, res) => {
    const sections = [...res];
    const index = sections.findIndex(({ section }) => section === "rp-updater");
    if (index < 0) return res;

    if (sections.find(({ section }) => section === "plugin-browser")) return sections;

    sections.splice(
      index + 1,
      0,
      ...[
        { section: "DIVIDER" },
        { section: "plugin-browser", label: "Plugin Browser", element: PluginBrowser },
      ],
    );
    return sections;
  });
}

export function stop(): void {
  inject.uninjectAll();
}
