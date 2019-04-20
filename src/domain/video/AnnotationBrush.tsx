import * as React from 'react';
import { fromEvent, Observable } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import styled from 'styled-components';
import { Annotation } from '../annotations/types';

const getMouseDownStream = (controlElement: HTMLVideoElement): Observable<Event> =>
    fromEvent(controlElement, 'mousedown');
const getMouseUpStream = (controlElement: HTMLVideoElement): Observable<Event> =>
    fromEvent(controlElement, 'mouseup');
const getMouseMoveStream = (controlElement: HTMLVideoElement): Observable<Event> =>
fromEvent(controlElement, 'mousemove');

const getDragStream = (videoElement: HTMLVideoElement): Observable<Event> =>
getMouseDownStream(videoElement).pipe(switchMap(() =>
    getMouseMoveStream(videoElement).pipe(takeUntil(getMouseUpStream(document)))
));

const Border = styled.div<{ visible: boolean }>`
    display: ${props => props.visible};
    position: absolute;
    background: green;
`;

type Props = {
    annotationGroupId: string;
    timestamp: number;
    onAnnotationCreate: (newAnnotation: Annotation) => void;
    videoElement: () => HTMLVideoElement | null;
};

type State = {
    top: number;
    left: number;
    visible: boolean;
    width: number;
    height: number;
};

class AnnotationBrush extends React.PureComponent<Props, State> {
    state = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        visible: false,
    };

    componentDidMount() {
        const { videoElement } = this.props;
        if (videoElement()) {
            this.setVideoElement(videoElement());
        }
    }

    componentDidUpdate(prevProps: Props) {
        const { videoElement } = this.props;
        if (!prevProps.videoElement() && videoElement()) {
            this.setVideoElement(videoElement());
        }
    }

    setVideoElement(videoElement: HTMLVideoElement): void {
        getMouseDownStream(videoElement)
        .subscribe((event: any) => {
            this.setState({
                top: event.clientY,
                left: event.clientX,
                visible: true,
            });
        });
        getMouseUpStream(document)
        .subscribe(() => {
            const { annotationGroupId, timestamp, onAnnotationCreate } = this.props;
            const { left, width, height, top } = this.state;
            onAnnotationCreate({
                id: annotationGroupId,
                top,
                right: left + width,
                bottom: top + height,
                left,
                timestamp,
                visible: true,
            });
            this.setState({
                visible: false,
                top: 0,
                left: 0,
                height: 0,
                width: 0,
            });
        });
        getDragStream(videoElement)
        .subscribe((event: any) => {
            const x = event.clientX;
            const y = event.clientY;
            const { left, top } = this.state;
            this.setState({ width: Math.abs(x - left), height: Math.abs(y - top) });
        });
    }

    render() {
        const {
            timestamp,
            videoElement,
            onAnnotationCreate,
        } = this.props;
        const { top, left, visible, width, height } = this.state;
        return (
            <Border visible={visible} style={{ left, top, height, width }} />
        );
    }
}

export default AnnotationBrush;
