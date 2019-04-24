import * as React from 'react';
import { fromEvent, Observable } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import styled from 'styled-components';
import { Annotation } from '../annotations/types';

const getMouseDownStream = (controlElement: HTMLElement): Observable<any> =>
    fromEvent(controlElement, 'mousedown');
const getMouseUpStream = (controlElement: HTMLElement): Observable<any> =>
    fromEvent(controlElement, 'mouseup');
const getMouseMoveStream = (controlElement: HTMLElement): Observable<any> =>
    fromEvent(controlElement, 'mousemove');

const getDragStream = (videoElement: HTMLVideoElement): Observable<any> =>
    getMouseDownStream(videoElement).pipe(switchMap(() =>
        getMouseMoveStream(videoElement).pipe(takeUntil(getMouseUpStream(document.body)))
    ));

type BorderProps = { visible: boolean };

const Border = styled.div<BorderProps>`
    display: ${(props: BorderProps) => props.visible};
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
        const element = videoElement();
        if (element) {
            this.setVideoElement(element);
        }
    }

    componentDidUpdate(prevProps: Props) {
        const { videoElement } = this.props;
        const newElement = videoElement();
        if (!prevProps.videoElement() && newElement) {
            this.setVideoElement(newElement);
        }
    }

    setVideoElement(videoElement: HTMLVideoElement): void {
        getMouseDownStream(videoElement)
        .subscribe((event: any) => {
            console.log('DRAGSTART');
            this.setState({
                top: event.clientY,
                left: event.clientX,
                visible: true,
            });
        });

        getMouseUpStream(document.body)
        .subscribe(() => {
            console.log('MOUSEUP');
            const { annotationGroupId, onAnnotationCreate } = this.props;
            const { left, width, height, top } = this.state;
            if (width || height) {
                const newAnnotation = {
                    top,
                    right: left + width,
                    bottom: top + height,
                    left,
                    id: annotationGroupId,
                    timestamp: videoElement.currentTime,
                    visible: true,
                };
                onAnnotationCreate(newAnnotation);

                this.setState({
                    visible: false,
                    top: 0,
                    left: 0,
                    height: 0,
                    width: 0,
                });
            }
        });

        getDragStream(videoElement)
        .subscribe((event: any) => {
            console.log('DRAG');
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
