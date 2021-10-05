import React, { useEffect, useRef, useState } from 'react';
import DeckGL from 'deck.gl';
import { ImageLayer } from '@hms-dbmi/viv';



function ImageThumbnail({imgPath, zarrGroup}) {

    console.log('imgPath', imgPath, 'zarrGroup', zarrGroup);
    const deckRef = useRef<DeckGL>(null);

    const [imgState, setImgState] = useState({});

    async function loadThumb() {

        const imgAttrs = await zarrGroup.getItem(imgPath).then((g) => g.attrs.asObject());
        // Lowest resolution is the 'path' of the last 'dataset' from the first multiscales
        console.log('imgAttrs', imgAttrs);
        const { datasets } = imgAttrs.multiscales[0];
        const resolution = datasets[datasets.length - 1].path;
        console.log('resolution', resolution);
        const arrayUrl = `${imgPath}/${resolution}`;
        const z_arr = await zarrGroup.getItem(arrayUrl);
        console.log('ImageThumbnail z_arr', z_arr);
        setImgState({imgAttrs, z_arr})
    }

    useEffect(() => {
        loadThumb();
    }, []);


    let viewer = null;

    function getRgb(color, greyscale) {
        // return [true, true, true] for white, or [true, false, false] for red
        return [
            (color[0] == "F" || greyscale) ? 255 : 0,
            (color[2] == "F" || greyscale) ? 255 : 0,
            (color[4] == "F" || greyscale) ? 255 : 0
        ]
    }

    if (imgState.z_arr) {
        const { imgAttrs, z_arr} = imgState;

        const { channels } = imgAttrs.omero;
        const greyscale = imgAttrs.omero?.rdefs?.model == "greyscale"

        const activeIndx = channels.flatMap((ch, idx) => ch.active ? [idx] : [])
        const activeChs = channels.filter(ch => ch.active);

        let ranges = activeChs.map(ch => [ch.window.start, ch.window.end]);
        let rgbColors = activeChs.map(ch => getRgb(ch.color, greyscale));

        const dims = z_arr.shape.length;
        const width = z_arr.shape[dims - 1];
        const height = z_arr.shape[dims - 2];

        // fetch 2D array for each channel
        // chunk is [t, c, z] (if we have those dimensions)
        const axes = imgAttrs.multiscales[0].axes || 'tczyx'.split("");
        const defaultChunk = axes.slice(0, -2)
            .map((axis, index) => {
                // thumbnail is T=0 and Z=midpoint
                if (axis == 't' || axis == 'c') return 0;
                if (axis == 'z') return Math.floor(z_arr.shape[index] / 2);
            });
        console.log("defaultChunk", defaultChunk);
        const channelIndex = axes.indexOf('c');
        const chunks = activeIndx.map(idx => {
            let chk = [...defaultChunk];
            chk[channelIndex] = idx;
            return chk;
        });

        const dimensions = [0, 1, 2, 'y', 'x'].map((field) => ({ field }));
        const loader = new ZarrLoader({ data:z_arr, dimensions });
        const imageLayer = new ImageLayer({
            loader,  // ZarrLoader
            loaderSelection: chunks,
            colorValues: [[255, 0, 0], [0, 255, 0]],
            sliderValues: ranges,
            channelIsOn: [true, true],
        });
            
        viewer = <DeckGL
            ref={deckRef}
            layers={[imageLayer]}
            viewState={viewState}
            onViewStateChange={(e) => setViewState(e.viewState)}
            views={[new OrthographicView({ id: 'ortho', controller: true })]}
        />
    }

    return (
        <li>{ imgPath}
            {viewer}
        </li>
    );
}

export default ImageThumbnail;
