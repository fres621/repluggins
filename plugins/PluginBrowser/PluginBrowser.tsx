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
    <div
      style={{
        display: "grid",
        gridGap: "16px",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      }}>
      {plugins.results.map((result) => (
        <Flex
          direction={Flex.Direction.VERTICAL}
          align={Flex.Align.CENTER}
          style={{
            width: "100%",
            height: "100px",
            backgroundColor: "var(--background-secondary-alt)",
            borderRadius: "16px",
            padding: "12px",
          }}>
          <Text
            style={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              width: "100%",
              textAlign: "center",
            }}
            variant="text-md/bold"
            tag="h2">
            {result.name}
          </Text>
          <Text variant="text-sm/normal" color="text-muted" tag="span">
            by {result.author.name}
          </Text>
          <Flex align={Flex.Align.CENTER} style={{ height: "50px" }}>
            <Text
              variant="text-sm/medium"
              style={{
                marginTop: "5px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "center",
              }}>
              {result.description}
            </Text>
          </Flex>
        </Flex>
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
    <Flex justify={Flex.Justify.AROUND} align={Flex.Align.CENTER} style={{ marginBottom: "10px" }}>
      <Flex
        justify={Flex.Justify.CENTER}
        align={Flex.Align.CENTER}
        style={{
          flex: "none",
          backgroundColor: "var(--background-secondary-alt)",
          width: "45px",
          height: "45px",
          borderRadius: "50%",
        }}>
        <Text>Prev</Text>
      </Flex>
      {Array.from({ length: 5 }).map((_, i) => (
        <Flex
          justify={Flex.Justify.CENTER}
          align={Flex.Align.CENTER}
          style={{
            flex: "none",
            backgroundColor:
              i + offset === page ? "var(--brand-experiment)" : "var(--background-secondary-alt)",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
          }}>
          <Text>{i + offset}</Text>
        </Flex>
      ))}
      <div style={{}}>
        <Flex
          justify={Flex.Justify.CENTER}
          align={Flex.Align.CENTER}
          style={{
            flex: "none",
            backgroundColor: "var(--background-secondary-alt)",
            width: "45px",
            height: "45px",
            borderRadius: "50%",
          }}>
          <Text>Next</Text>
        </Flex>
      </div>
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
      <div style={{ marginTop: loading ? "200px" : "30px" }}>
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
