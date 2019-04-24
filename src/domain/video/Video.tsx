import * as React from 'react';
import styled from 'styled-components';
import { TimelineMax } from "gsap";
import { Annotation, AnnotatedObject } from 'domain/annotations/types';
import Box from 'domain/annotations/Box';
import { setupVideo } from './lifecycleUtil';
import Controls, { CONTROLS_HEIGHT, PLAY_PAUSE_WIDTH } from './Controls';
import AnnotationBrush from './AnnotationBrush';

const Container = styled.div<{ height: number; width: number}>`
    background: black;
    height: ${props => props.height}px;
    width: ${props => props.width}px;

    video {
        left: ${PLAY_PAUSE_WIDTH}px;
    }
`;

type BoundingBox = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};

const handleOnEnded = (timeline: TimelineMax, setPause: (paused: boolean) => void) => (): void => {
    timeline.pause();
    setPause(true);
};

const setNewAnnotation =
    (
        groups: AnnotatedObject[],
        updateGroups: (groups: AnnotatedObject[]) => void,
        timeline: TimelineMax,
    ) =>
    (newAnnotation: Annotation) => {
        updateGroups(
            groups.map((group: AnnotatedObject) => {
                if (group.id === newAnnotation.id) {
                    group.annotations = [...group.annotations, newAnnotation];
                }
                return group;
            })
        );
    };

export type Props = {
    annotationGroups: AnnotatedObject[];
    src: string;
};

const Video: React.SFC<Props> = ({
        annotationGroups,
        src,
    }) => {
    const [groups, updateGroups] = React.useState(annotationGroups);
    const [timeline] = React.useState(new TimelineMax());
    const [videoHeight, setVideoHeight] = React.useState(0)
    const [videoWidth, setVideoWidth] = React.useState(0)
    const [paused, setPause] = React.useState(true);
    const videoRef = React.useRef(null);
    const screenRef = React.useRef(null);
    React.useEffect(setupVideo(videoRef, timeline, setVideoHeight, setVideoWidth), []);

    const controlsTop = videoHeight - CONTROLS_HEIGHT;
    return (
        <Container height={videoHeight + CONTROLS_HEIGHT} width={videoWidth}>
            <div
                ref={screenRef}
                style={{
                    zIndex: 2,
                    position: 'absolute',
                    top: 0,
                    left: PLAY_PAUSE_WIDTH,
                    height: videoHeight,
                    width: videoWidth,
                }}
            />
            <video onEnded={handleOnEnded(timeline, setPause)} ref={videoRef} controls={false}>
                <source src={src} type="video/mp4" />
            </video>
            <Controls
                paused={paused}
                setPause={setPause}
                timeline={timeline}
                videoRefGetter={() => videoRef.current}
            />
            <AnnotationBrush
                annotationGroupId="a"
                timestamp={videoRef.current ? videoRef.current.currentTime : 0}
                screenRef
                screenElement={() => screenRef.current}
                videoElement={() => videoRef.current}
                onAnnotationCreate={setNewAnnotation(groups, updateGroups, timeline)}
            />
            {groups.map((group: AnnotatedObject) => (
                <Box
                    {...group}
                    videoWidthPx={videoWidth}
                    videoHeightPx={videoHeight}
                    timeline={timeline}
                    videoRef={videoRef}
                    key={group.id}
                />
            ))}
        </Container>
    );
};

export default Video;
