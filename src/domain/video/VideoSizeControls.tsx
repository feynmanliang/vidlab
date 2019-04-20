import * as React from 'react';
import styled from 'styled-components';

const updateVideoSize = (
    heightWidthRatio: number,
    setVideoWidth: (height: number) => void,
    setVideoHeight: (width: number) => void,
    fractionOfScreen: number
) => () => {
    const newWidth = window.innerWidth * fractionOfScreen;
    const newHeight = heightWidthRatio * newWidth;
    setVideoWidth(newWidth);
    setVideoHeight(newHeight);
};

const Controls = styled.div`
`;

type Props = {
    heightWidthRatio: number;
    setVideoHeight: (heightPx: number) => void;
    setVideoWidth: (widthPx: number) => void;
};

const VideoSizeControls: React.SFC<Props> = ({
        heightWidthRatio,
        setVideoHeight,
        setVideoWidth,
}) => (
    <Controls>
        <button
            onClick={updateVideoSize(heightWidthRatio, setVideoWidth, setVideoHeight, 1/3)}
        >
            small
        </button>
        <button
            onClick={updateVideoSize(heightWidthRatio, setVideoWidth, setVideoHeight, 1/2)}
        >
            medium
        </button>
        <button
            onClick={updateVideoSize(heightWidthRatio, setVideoWidth, setVideoHeight, 1)}
        >
            full
        </button>
    </Controls>
);

export default VideoSizeControls;
