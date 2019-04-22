import * as React from 'react';
import { fromEvent, Observable } from 'rxjs';
import { auditTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { TimelineMax } from "gsap";
import styled from 'styled-components';

const HANDLE_HEIGHT = 20;

const HANDLE_WIDTH = 10;

export const PLAY_PAUSE_WIDTH = 50 + (HANDLE_WIDTH / 2);

export const CONTROLS_HEIGHT = 50;

const Strip = styled.div`
    position: absolute;
    top: ${(CONTROLS_HEIGHT / 2) - 1}px;
    height: 1px;
    width: 100%;
    background: black;
`;

const Handle = styled.div`
    position: absolute;
    background: blue;
    height: ${HANDLE_HEIGHT}px;
    width: ${HANDLE_WIDTH}px;
    border-radius: 100%;
    top: ${(CONTROLS_HEIGHT / 2) - (HANDLE_HEIGHT / 2)}px;
`;

const Container = styled.div`
    display: flex;
    width: 100%;
    height: ${CONTROLS_HEIGHT}px;
`;

const Track = styled.div`
    flex-grow: 1;
    background: white;
    border: 1px solid;
    height: ${CONTROLS_HEIGHT}px;
    position: relative;
`;

const ButtonContainer = styled.div`
    border: 1px solid;
    height: ${CONTROLS_HEIGHT}px;
    display: inline-flex
    flex-direction: column;
`;

const ControlButton = styled.button`
    flex-grow: 1;
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
                        setHandleX(Math.max(0, ((newTime / duration) * width) - PLAY_PAUSE_WIDTH));
                    }
                });

                getDragStream(controlElement, handleElement).subscribe((position: number) => {
                    const videoElement = videoRefGetter();
                    if (videoElement) {
                        videoElement.currentTime = getCurrentTime(videoElement, position);
                        setHandleX(Math.max(0, position - PLAY_PAUSE_WIDTH));
                    }
                });
            }
        },
        []
    );

    return (
        <Container>
            <ButtonContainer>
                <ControlButton onClick={handlePause(timeline, videoRefGetter)}>
                    pause
                </ControlButton>
                <ControlButton onClick={handlePlay(timeline, videoRefGetter)}>
                    play
                </ControlButton>
            </ButtonContainer>
            <Track ref={controlsRef}>
                <Strip />
                <Handle ref={handleRef} style={{ left: handleX }} />
            </Track>
        </Container>
    );
};

export default Controls;
