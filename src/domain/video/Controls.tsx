import * as React from 'react';
import { fromEvent, Observable } from 'rxjs';
import { auditTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { TimelineMax } from "gsap";
import styled from 'styled-components';

export const CONTROLS_HEIGHT = 50;

const Handle = styled.div`
    position: absolute;
    background: blue;
    height: 20px;
    width: 20px;
    border-radius: 100%;
`;

const Container = styled.div`
    background: teal;
    width: 100%;
    height: ${CONTROLS_HEIGHT}px;
    position: relative;
`;

const getCurrentTime = (videoElement: HTMLVideoElement, position: number): number => {
    const width = videoElement.clientWidth;
    const duration = videoElement.duration;
    return (position / width) * duration;
};

const getMouseDownStream = (controlElement: HTMLVideoElement): Observable<Event> =>
    fromEvent(controlElement, 'mousedown');
const getMouseUpStream = (controlElement: HTMLVideoElement): Observable<Event> =>
    fromEvent(controlElement, 'mouseup');
const getMouseMoveStream = (controlElement: HTMLVideoElement): Observable<Event> =>
    fromEvent(controlElement, 'mousemove');

const getDragStream = (controlElement: HTMLVideoElement, handleElement: HTMLDivElement): Observable<Event> =>
getMouseDownStream(handleElement).pipe(switchMap(() =>
    getMouseMoveStream(controlElement).pipe(takeUntil(getMouseUpStream(controlElement)))
))
.pipe(auditTime(50))
.pipe(map((event: any) => event.clientX));

const handlePlay = (timeline: TimelineMax, videoGetter: () => null | HTMLVideoElement) => (): void => {
    const videoElement = videoGetter();
    if (videoElement) {
        timeline.play();
        videoElement.play();
    }
};

const handlePause = (timeline: TimelineMax, videoGetter: () => null | HTMLVideoElement) => (): void => {
    const videoElement = videoGetter();
    if (videoElement) {
        timeline.pause();
        videoElement.pause();
    }
};

type Props = {
    timeline: TimelineMax;
    videoRefGetter: () => null | HTMLVideoElement;
};

const Controls: React.SFC<Props> = ({
    timeline,
    videoRefGetter,
}) => {
    const controlsRef = React.useRef(null);
    const handleRef = React.useRef(null);
    const [handleX, setHandleX] = React.useState(0);
    React.useEffect(
        () => {
            const controlElement = controlsRef.current;
            const handleElement = handleRef.current;
            if (controlElement && handleElement) {
                videoRefGetter().addEventListener('timeupdate', (event: any) => {
                    const videoElement = videoRefGetter();
                    if (videoElement) {
                        const newTime = event.target.currentTime;
                        const width = videoElement.clientWidth;
                        const duration = videoElement.duration;
                        setHandleX((newTime / duration) * width);
                    }
                });

                getDragStream(controlElement, handleElement).subscribe((position: number) => {
                    const videoElement = videoRefGetter();
                    if (videoElement) {
                        videoElement.currentTime = getCurrentTime(videoElement, position);
                        setHandleX(position);
                    }
                });
            }
        },
        []
    );
    return (
        <Container ref={controlsRef}>
            <Handle ref={handleRef} style={{ left: handleX - 10 }} />
            <button onClick={handlePause(timeline, videoRefGetter)}>
                pause
            </button>
            <button onClick={handlePlay(timeline, videoRefGetter)}>
                play
            </button>
        </Container>
    );
};

export default Controls;
