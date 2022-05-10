import React, { useEffect, useRef, useState } from 'react';
import DeckGL from 'deck.gl';
import type { Group, ZarrArray } from 'zarr';
import { OrthographicView } from '@deck.gl/core';
import { ImageLayer, ZarrPixelSource } from '@hms-dbmi/viv';

import { fitBounds, guessTileSize } from '../../utils';
// import { Attrs } from '../../../types/ome';

const THUMB = { WIDTH: 100, HEIGHT: 75 };
const thumbStyle = {
  position: 'relative',
  width: THUMB.WIDTH,
  height: THUMB.HEIGHT,
  border: 'solid grey 1px',
};

type ThumbProps = {
    imgPath: string,
    zarrGroup: Group
}

type ThumbState = {
    z_arr: ZarrArray,
    imgAttrs: Ome.Attrs,
}

function ImageThumbnail({ imgPath, zarrGroup }: ThumbProps) {
  console.log('imgPath', imgPath, 'zarrGroup', zarrGroup);

  const [imgState, setImgState] = useState<ThumbState | undefined>(undefined);

  async function loadThumb() {
    const imgAttrs = await zarrGroup.getItem(imgPath).then((g) => g.attrs.asObject()) as Ome.Attrs;
    // Lowest resolution is the 'path' of the last 'dataset' from the first multiscales
    console.log('imgAttrs', imgAttrs);
    if ('multiscales' in imgAttrs) {
      const { datasets } = imgAttrs.multiscales[0];
      const resolution = datasets[datasets.length - 1].path;
      console.log('resolution', resolution);
      const arrayUrl = `${imgPath}/${resolution}`;
      const z_arr = await zarrGroup.getItem(arrayUrl) as ZarrArray;
      console.log('ImageThumbnail z_arr', z_arr);
      setImgState({ imgAttrs, z_arr });
    }
  }

  useEffect(() => {
    loadThumb();
  }, []);

  let viewer = null;

  function getRgb(color: string, greyscale: boolean) {
    // return [true, true, true] for white, or [true, false, false] for red
    return [
      color[0] == 'F' || greyscale ? 255 : 0,
      color[2] == 'F' || greyscale ? 255 : 0,
      color[4] == 'F' || greyscale ? 255 : 0,
    ];
  }

  if (imgState) {
    const { imgAttrs, z_arr } = imgState;

    if (imgAttrs && 'omero' in imgAttrs) {
    const { channels } = imgAttrs.omero;
    const greyscale = imgAttrs.omero?.rdefs?.model == 'greyscale';

    const activeIndx = channels.flatMap((ch, idx) => (ch.active ? [idx] : []));
    const activeChs = channels.filter((ch) => ch.active);

    let ranges = activeChs.map((ch) => [ch.window.start, ch.window.end]);
    let rgbColors = activeChs.map((ch) => getRgb(ch.color, greyscale));

    const dims = z_arr.shape.length;
    const width = z_arr.shape[dims - 1];
    const height = z_arr.shape[dims - 2];

    // fetch 2D array for each channel
    // chunk is [t, c, z] (if we have those dimensions)
    const axes = imgAttrs.multiscales[0].axes || 'tczyx'.split('');
    const defaultChunk = axes.slice(0, -2).map((axis, index) => {
      // thumbnail is T=0 and Zx=midpoint
      if (axis == 't' || axis == 'c') return 0;
      if (axis == 'z') return Math.floor(z_arr.shape[index] / 2);
    });
    console.log('defaultChunk', defaultChunk);
    const channelIndex = axes.map(a => a.toString()).indexOf('c');
    const chunks = activeIndx.map((idx) => {
      let chk = [...defaultChunk];
      chk[channelIndex] = idx;
      return chk;
    });

    console.log("guessTileSize(z_arr)", guessTileSize(z_arr));

    const selections: number[][] = [];

    const loader = new ZarrPixelSource(z_arr, axes as [...string[], 'y', 'x'], guessTileSize(z_arr));
    const imageLayer = new ImageLayer({
      loader, // ZarrLoader
      loaderSelection: chunks,
      colorValues: rgbColors,
      sliderValues: ranges,
      channelIsOn: [true, true],
    });

    const { zoom } = fitBounds([width, height], [THUMB.WIDTH, THUMB.HEIGHT], 1, 0);

    viewer = (
      <DeckGL
        layers={[imageLayer]}
        style={thumbStyle}
        viewState={{ zoom }}
        views={[new OrthographicView({ id: 'ortho', controller: true })]}
      />
    );
    }
  }

  return (
    <li>
      {imgPath}
      {viewer}
    </li>
  );
}

export default ImageThumbnail;
