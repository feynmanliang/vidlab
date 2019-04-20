import { TimelineMax, TweenMax } from 'gsap';
import { Annotation } from './types';

const createAnnotations = (
        annotations: Annotation[],
        timeline: TimelineMax,
        box: HTMLDivElement,
        originalVideoHeight: number,
        originalVideoWidth: number,
        videoWidthPx: number,
        videoHeightPx: number,
    ): void => {
//    timeline.pause();
//    timeline.clear();
    annotations.forEach(({ timestamp, top, right, bottom, left, visible }: Annotation, i: number) => {
        const prevKeyframeTime = i === 0 ? 0 : annotations[i - 1].timestamp;

        if (!visible) {
            timeline.add(TweenMax.to(box, 0, { opacity: 0.0 }), timestamp);
        } else {
            const heightMultiplier = videoHeightPx / originalVideoHeight;
            const widthMultiplier = videoWidthPx / originalVideoWidth;
            timeline.add(
                TweenMax.to(box, timestamp - prevKeyframeTime, {
                opacity: 1.0,
                top: `${top * heightMultiplier}px`,
                left: `${left * widthMultiplier}px`,
                width: `${(right - left) * widthMultiplier}px`,
                height: `${(bottom - top) * heightMultiplier}px`
                }),
                prevKeyframeTime
            );
        }
    });

    console.log(timeline);
};

export const initialSetupBox = (
        annotations: Annotation[],
        videoRef: React.RefObject<HTMLVideoElement>,
        boxRef: React.RefObject<HTMLDivElement>,
        timeline: TimelineMax,
        originalVideoHeight: number,
        originalVideoWidth: number,
        videoWidthPx: number,
        videoHeightPx: number,
    ) => () => {
    let loaded = false;
    const video = videoRef.current;
    if (video !== null) {
        video.addEventListener('canplay', () => {
            const box = boxRef.current;
            if (box !== null && !loaded) {
                loaded = true;
                createAnnotations(
                    annotations,
                    timeline,
                    box,
                    originalVideoHeight,
                    originalVideoWidth,
                    videoWidthPx,
                    videoHeightPx,
                );
            }
        });
    }
};

export const updateBoxSizes = (
        annotations: Annotation[],
        boxRef: React.RefObject<HTMLDivElement>,
        timeline: TimelineMax,
        originalVideoHeight: number,
        originalVideoWidth: number,
        videoWidthPx: number,
        videoHeightPx: number,
    ) => () => {
    const box = boxRef.current;
    if (box !== null) {
        timeline.clear();
        createAnnotations(
            annotations,
            timeline,
            box,
            originalVideoHeight,
            originalVideoWidth,
            videoWidthPx,
            videoHeightPx,
        );
    }
};

export const updateBoxes = (
        annotations: Annotation[],
        videoRef: React.RefObject<HTMLVideoElement>,
        boxRef: React.RefObject<HTMLDivElement>,
        timeline: TimelineMax,
        videoWidthPx: number,
        videoHeightPx: number,
        ) => () => {
    console.log(timeline);
};
