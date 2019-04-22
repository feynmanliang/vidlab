import * as React from 'react';
import { fromEvent, Observable } from 'rxjs';
import { auditTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { TimelineMax } from "gsap";
import styled from 'styled-components';

const HANDLE_HEIGHT = 15;

const HANDLE_WIDTH = 15;

export const PLAY_PAUSE_WIDTH = 50 + (HANDLE_WIDTH / 2);

export const CONTROLS_HEIGHT = 70;

const stripTransition = `
    transition: all 0.15s;
`;

const stripStyle = `
    border-radius: 3px;
    position: absolute;
    top: ${(CONTROLS_HEIGHT / 2) - 2.5}px;
    height: 5px;
    transform: scale(1);
    &:hover {
        transform: scaleY(1.2);
        + .handle {
            transform: scale(1.2);
        }
    }
`;

const InactiveStrip = styled.div<{ width: number }>`
    right: 0px;
    ${stripTransition}
    ${stripStyle}
    background: rgba(0, 0, 0, 0.2);
    width: ${props => props.width}px;
`;

const ActiveStrip = styled.div<{ width: number }>`
    ${stripTransition}
    ${stripStyle}
    background: #FF0000;
    width: ${props => props.width}px;
`;

const Handle = styled.div`
    ${stripTransition};
    svg {
        ${stripTransition};
        &:hover, &:active {
            transform: scale(1.2);
        }
    }
    position: absolute;
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
    height: ${CONTROLS_HEIGHT}px;
    position: relative;
    &:hover {
        ${stripTransition};
        svg {
            transform: scale(1.2);
        }

        .strip {
            transform: scaleY(1.2);
        }
    }
`;

const ButtonContainer = styled.div`
    height: ${CONTROLS_HEIGHT}px;
    display: inline-flex
`;

const ControlButton = styled.button`
    ${stripTransition}
    font-size: 16px;
    outline: none;
    border: 0;
    flex-grow: 1;
    &:hover, &:focus {
        font-weight: bold;
        cursor: pointer;
    }
`;

const getCurrentTime = (videoElement: HTMLVideoElement, position: number): number => {
    const width = videoElement.clientWidth;
    const duration = videoElement.duration;
    return (position / width) * duration;
};

const handleTrackClick = (
        videoGetter: () => null | HTMLVideoElement,
        setHandleX: (x: number) => void
    ) => (event: React.MouseEvent<any>): void => {
    const position = event.clientX;
    setHandleX(Math.max(0, position - PLAY_PAUSE_WIDTH));
    const videoElement = videoGetter();
    if (videoElement) {
        videoElement.currentTime = getCurrentTime(videoElement, position);
    }
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

const handlePlay = (
        timeline: TimelineMax,
        videoGetter: () => null | HTMLVideoElement,
        setPause: (paused: boolean) => void
    ) => (): void => {
    const videoElement = videoGetter();
    if (videoElement) {
        setPause(false);
        timeline.play();
        videoElement.play();
    }
};

const handlePause = (
        timeline: TimelineMax,
        videoGetter: () => null | HTMLVideoElement,
        setPause: (paused: boolean) => void
    ) => (): void => {
    const videoElement = videoGetter();
    if (videoElement) {
        setPause(true);
        timeline.pause();
        videoElement.pause();
    }
};

type Props = {
    timeline: TimelineMax;
    videoRefGetter: () => null | HTMLVideoElement;
    paused: boolean;
    setPause: (paused: boolean) => void;
};

const Controls: React.SFC<Props> = ({
    timeline,
    videoRefGetter,
    paused,
    setPause,
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
            <ButtonContainer style={{ width: PLAY_PAUSE_WIDTH }}>
                {paused ?
                    <ControlButton onClick={handlePlay(timeline, videoRefGetter, setPause)}>
                        play
                    </ControlButton> :
                    <ControlButton onClick={handlePause(timeline, videoRefGetter, setPause)}>
                        pause
                    </ControlButton>}
            </ButtonContainer>
            <Track ref={controlsRef} onClick={handleTrackClick(videoRefGetter, setHandleX)}>
                <ActiveStrip width={handleX} className="strip" />
                <InactiveStrip
                    width={videoRefGetter() ? videoRefGetter().clientWidth - handleX - PLAY_PAUSE_WIDTH : handleX}
                    className="strip"
                />
                <Handle className="handle" ref={handleRef} style={{ left: handleX }}>
                    <svg height="15" width="15">
                        <circle r="7.5" cx="7.5" cy="7.5" fill="#FF0000" />
                    </svg>
                </Handle>
            </Track>
        </Container>
    );
};

export default Controls;
