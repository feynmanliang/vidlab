import * as React from 'react';
import { TimelineMax, TweenMax } from 'gsap';
import styled from 'styled-components';
import { AnnotatedObject, Annotation } from './types';
import { getBackgroundFromId } from './util';
import { updateBoxSizes, initialSetupBox } from './lifecycleUtil';

const StyledBox = styled.div<{ background: string }>`
    position: absolute;
    z-index: 1;
    border: 3px solid ${props => props.background};
`;

export type Props = AnnotatedObject & {
    timeline: TimelineMax;
    videoRef: React.RefObject<HTMLVideoElement>;
    videoWidthPx: number;
    videoHeightPx: number;
};

const Box: React.SFC<Props> = ({
        id,
        annotations,
        timeline,
        videoRef,
        heightPx,
        widthPx,
        videoWidthPx,
        videoHeightPx,
    }) => {
    const boxRef = React.useRef(null);
    React.useEffect(
        initialSetupBox(
            annotations,
            videoRef,
            boxRef,
            timeline,
            heightPx,
            widthPx,
            videoWidthPx,
            videoHeightPx,
        ),
        []
    );
    React.useEffect(
        updateBoxSizes(
            annotations,
            boxRef,
            timeline,
            heightPx,
            widthPx,
            videoWidthPx,
            videoHeightPx
        ),
        [annotations, videoWidthPx, videoHeightPx],
    );
    return (
        <StyledBox
            ref={boxRef}
            background={getBackgroundFromId(id)}
        />
    );
};

export default Box;
