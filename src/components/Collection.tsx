import React, { useReducer } from 'react';
import { useAtomValue } from 'jotai/utils';

import { collectionAtom } from '../state';
import ImageThumbnail from './NgffCollection/ImageThumbnail';

function Collection() {
    const ngffCollection = useAtomValue(collectionAtom);

    console.log('ngffCollection', ngffCollection);
    if (!ngffCollection?.images.length) {
        return null;
    }
    return (
        <ul style={{"color": "white"}}>
            Collection
            {
                ngffCollection.images.map(img => (
                    <ImageThumbnail
                        key={img}
                        imgPath={img}
                        zarrGroup={ngffCollection.group}
                    >

                    </ImageThumbnail>))
            }
        </ul>
    );
}

export default Collection;
