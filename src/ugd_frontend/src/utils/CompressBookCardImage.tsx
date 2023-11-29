import { useState } from 'react'
import Resizer from 'react-image-file-resizer'

const CompressBookCardsImage = async (image: any) => {

    fetch(image)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network Response was not okay');
            }
            return response.blob();
        })
        .then(blob => {
            Resizer.imageFileResizer(
                blob,
                300,
                300,
                'PNG',
                90,
                0,
                (uri) => {
                    if (typeof uri === 'string') {
                        return uri;
                    }
                },
                'base64'
            );
        })
        .catch(error => {
            console.error('There was a problem fetching the image: ', error);
            console.log('Failed image URL:', image);
        });

}


export default CompressBookCardsImage