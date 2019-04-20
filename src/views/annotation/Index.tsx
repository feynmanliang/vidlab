import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Video from 'domain/video/Video';

const annotationGroups = [
    {
        heightPx: 720,
        widthPx: 1280,
        id: 'a',
        videoId: 'b',
        annotations: [
            {
                id: 'a',
                timestamp: 0,
                visible: false,
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            }
        ],
    }
];

ReactDOM.render(
    <Video
        annotationGroups={annotationGroups}
        src="./test_vid2.mp4"
    />,
    document.getElementById("app")
);
