import * as vizarr from '@hms-dbmi/vizarr';
import debounce from 'just-debounce-it';

async function initImjoy(viewer: vizarr.VizarrViewer) {
  const { imjoyRPC } = await import('imjoy-rpc');
  const api = await imjoyRPC.setupRPC({
    name: 'vizarr',
    description: 'A minimal, purely client-side program for viewing Zarr-based images with Viv & ImJoy.',
    version: vizarr.version,
  });
  api.export({
    add_image: viewer.addImage,
    set_view_state: viewer.setViewState,
  });
}

function initStandaloneApp(url: URL, viewer: vizarr.VizarrViewer) {
  // setup viewstate stuff
  {
    if (url.searchParams.has('viewState')) {
      const viewState = JSON.parse(url.searchParams.get('viewState')!);
      viewer.setViewState(viewState);
    }

    function handleViewChange(update: vizarr.ViewState) {
      const url = new URL(window.location.href);
      url.searchParams.set('viewState', JSON.stringify(update));
      window.history.pushState({}, '', decodeURIComponent(url.href));
    }

    // Pushing history too frequently can cause issues.
    // Better to debounce for state which may change rapidly.
    viewer.on('viewStateChange', debounce(handleViewChange, 200));
  }

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

function main() {
  console.log(`vizarr v${vizarr.version}: https://github.com/hms-dbmi/vizarr`);

  const viewer = vizarr.createViewer(document.querySelector('#root')!);

  // enable imjoy api when loaded as an iframe
  if (window.self !== window.top) {
    initImjoy(viewer);
    return;
  }

  const url = new URL(window.location.href);

  if (url.searchParams.has('source')) {
    initStandaloneApp(url, viewer);
  }
}

main();
