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

const getBrushDimensions = (height: number, width: number, left: number, top: number): { [key: string]: number } => {
    const base = { height: Math.abs(height), width: Math.abs(width) };

    if (width < 0) {
        base.left = left + width;
    } else {
        base.left = left;
    }

    if (height < 0) {
        base.top = top + height;
    } else {
        base.top = top;
    }

    return base;
};

type BorderProps = { visible: boolean };

const Border = styled.div<BorderProps>`
    display: ${(props: BorderProps) => props.visible};
    position: absolute;
    background: green;
`;

type Props = {
    screenElement: () => HTMLDivElement | null;
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
        const { screenElement, videoElement } = this.props;
        const screen = screenElement();
        const video = videoElement();
        if (video && screen) {
            this.setVideoElement(screen, video);
        }
    }

    componentDidUpdate(prevProps: Props) {
        const { screenElement, videoElement } = this.props;
        const screen = screenElement();
        const video = videoElement();
        if ((!prevProps.screenElement() && screen || !prevProps.videoElement() && video) && screen && video) {
            this.setVideoElement(screen, video);
        }
    }

    setVideoElement(screenElement: HTMLDivElement, videoElement: HTMLVideoElement): void {
        getMouseDownStream(screenElement)
        .subscribe((event: any) => {
            this.setState({
                top: event.clientY,
                left: event.clientX,
                visible: true,
            });
        });

        getMouseUpStream(screenElement)
        .subscribe(() => {
            const { annotationGroupId, onAnnotationCreate } = this.props;
            const { left, width, height, top } = this.state;
            if (width || height) {
                const dimensions = getBrushDimensions(height, width, left, top);
                const newAnnotation = {
                    top: dimensions.top,
                    right: dimensions.left + dimensions.width,
                    bottom: dimensions.top + dimensions.height,
                    left: dimensions.left,
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

        getDragStream(screenElement)
        .subscribe((event: any) => {
            const x = event.clientX;
            const y = event.clientY;
            const { left, top } = this.state;
            this.setState({ width: x - left, height: y - top });
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
            <Border
                visible={visible}
                style={getBrushDimensions(height, width, left, top)}
            />
        );
    }
}

export default AnnotationBrush;
