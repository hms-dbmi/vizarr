import debounce from "just-debounce-it";
import * as vizarr from "./src/index";

async function main() {
  console.log(`vizarr v${vizarr.version}: https://github.com/hms-dbmi/vizarr`);
  // biome-ignore lint/style/noNonNullAssertion: We know the element exists
  const viewer = await vizarr.createViewer(document.querySelector("#root")!);
  const url = new URL(window.location.href);

  if (!url.searchParams.has("source")) {
    return;
  }

  // see if we have initial viewState
  const viewStateString = url.searchParams.get("viewState");
  if (viewStateString) {
    const viewState = JSON.parse(viewStateString);
    viewer.setViewState(viewState);
  }

  // Add event listener to sync viewState as query param.
  // Debounce to limit how quickly we are pushing to browser history
  viewer.on(
    "viewStateChange",
    debounce((update: vizarr.ViewState) => {
      const url = new URL(window.location.href);
      url.searchParams.set("viewState", JSON.stringify(update));
      window.history.pushState({}, "", decodeURIComponent(url.href));
    }, 200),
  );

  // parse image config
  // @ts-expect-error - TODO: validate config
  const config: vizarr.ImageLayerConfig = {};

  for (const [key, value] of url.searchParams) {
    // @ts-expect-error - TODO: validate config
    config[key] = value;
  }

  // Make sure the source URL is decoded.
  viewer.addImage(config);

  const newLocation = decodeURIComponent(url.href);

  // Only update history if the new loacation is different from the current
  if (window.location.href !== newLocation) {
    window.history.pushState(null, "", newLocation);
  }
}

main();
