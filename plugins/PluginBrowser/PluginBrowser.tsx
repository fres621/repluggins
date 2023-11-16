/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { getAllPluginIds, getPlugins } from "./api";
import { PluginPage } from "./types";
import { common, components, webpack } from "replugged";

const { Messages } = common.i18n;
const { TextInput, ErrorBoundary, Loader, Text, Divider, Flex, Button } = components;

interface ErrorProps {
  message?: string;
  heading?: string;
  buttonText?: string;
  buttonAction?: (() => void) | null;
  image?: string;
}

const imageClass = (
  await webpack.waitForModule<{ image: string }>(
    webpack.filters.byProps("flexWrapper", "image", "note", "text", "title", "wrapper"),
  )
).image;

const { noResultsImage } = await webpack.waitForModule<{ noResultsImage: string }>(
  webpack.filters.byProps("noResultsImage"),
);

function Error({
  message = "An unknown error occurred",
  heading = "Well, this is awkward",
  buttonText = "Retry",
  buttonAction = null,
  image = imageClass,
}: ErrorProps): React.ReactElement | null {
  return (
    <Flex
      align={Flex.Align.CENTER}
      justify={Flex.Justify.CENTER}
      direction={Flex.Direction.VERTICAL}>
      <div className={image}></div>
      <Text.H2>{heading}</Text.H2>
      <Text
        variant="text-sm/normal"
        color="text-muted"
        tag="span"
        style={{ textTransform: "none", marginTop: "10px", marginBottom: "20px" }}>
        {message}
      </Text>
      {buttonAction && <Button onClick={buttonAction}>{buttonText}</Button>}
    </Flex>
  );
}

function Plugins({
  plugins,
  onClickRetry,
}: {
  plugins: PluginPage | null;
  onClickRetry: () => void;
}): React.ReactElement | null {
  console.log(plugins);
  if (!plugins)
    return (
      <Error
        message="An unknown error occurred while fetching the plugins"
        buttonAction={onClickRetry}
      />
    );

  if ("error" in plugins)
    return plugins.error === "NOT_FOUND" ? (
      <Error
        heading="No results found"
        message="No plugins match your query. Perhaps try a different one?"
        image={noResultsImage}
      />
    ) : (
      <Error heading="An error occurred" message={plugins.error} buttonAction={onClickRetry} />
    );
  return (
    <div>
      {plugins.results.map((result) => (
        <Text>{result.name}</Text>
      ))}
    </div>
  );
}

function Pagination({
  page,
  numPages,
  onClick,
}: {
  page: number;
  numPages: number;
  onClick: () => void;
}): React.ReactElement | null {
  let offset = Math.max(3, page) - 2;
  return (
    <Flex justify={Flex.Justify.AROUND}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div style={{}}>
          <Text>{i + offset}</Text>
        </div>
      ))}
    </Flex>
  );
}

let timeouts = new Map();

/** Do (fn) in (time) ms, unless this function is called again before (time) ms */
function maybeDo(key: string, fn: () => unknown, time: number | undefined): void {
  if (timeouts.has(key)) {
    clearTimeout(timeouts.get(key)!);
  }
  timeouts.set(
    key,
    setTimeout(() => {
      timeouts.delete(key);
      fn();
    }, time),
  );
}

export default function PluginBrowser(): React.ReactElement | null {
  const [search, setSearch] = useState<string>("");
  const [plugins, setPlugins] = useState<PluginPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    (async () => {
      setPlugins(await getPlugins(page));
      setLoading(false);
    })();
  }, []);

  async function retry(): Promise<void> {
    setLoading(true);
    setPlugins(await getPlugins(page));
    setLoading(false);
  }

  function switchPage(): void {
    console.log(":3");
  }

  return (
    <ErrorBoundary>
      <Text.H2>Plugin Browser</Text.H2>
      <Divider style={{ margin: "40px 0px" }} />
      <TextInput
        placeholder={Messages.REPLUGGED_SEARCH_FOR_ADDON.format({ type: "plugin" })}
        onChange={(e) => maybeDo("setSearch", () => setSearch(e), 700)}
        autoFocus={true}
      />
      <div style={{ marginTop: "100px" }}>
        {loading ? (
          <Loader />
        ) : (
          <>
            {!plugins || "error" in plugins || (
              <Pagination page={page} numPages={plugins.numPages} onClick={switchPage} />
            )}
            <Plugins plugins={plugins} onClickRetry={retry} />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
