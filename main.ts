import * as vizarr from './src/index';
import debounce from 'just-debounce-it';

function initStandaloneApp(viewer: vizarr.VizarrViewer) {
  const url = new URL(window.location.href);

  if (!url.searchParams.has('source')) {
    return;
  }

  // see if we have initial viewState
  if (url.searchParams.has('viewState')) {
    const viewState = JSON.parse(url.searchParams.get('viewState')!);
    viewer.setViewState(viewState);
  }

  // Add event listener to sync viewState as query param.
  // Debounce to limit how quickly we are pushing to browser history
  viewer.on(
    'viewStateChange',
    debounce((update: vizarr.ViewState) => {
      const url = new URL(window.location.href);
      url.searchParams.set('viewState', JSON.stringify(update));
      window.history.pushState({}, '', decodeURIComponent(url.href));
    }, 200)
  );

  // parse image config
  const config: any = {};

  for (const [key, value] of url.searchParams) {
    config[key] = value;
  }

  // Make sure the source URL is decoded.
  viewer.addImage(config);

  const newLocation = decodeURIComponent(url.href);

  // Only update history if the new loacation is different from the current
  if (window.location.href !== newLocation) {
    window.history.pushState(null, '', newLocation);
  }
}

async function main() {
  console.log(`vizarr v${vizarr.version}: https://github.com/hms-dbmi/vizarr`);
  const viewer = await vizarr.createViewer(document.querySelector('#root')!);
  initStandaloneApp(viewer);
}

main();
