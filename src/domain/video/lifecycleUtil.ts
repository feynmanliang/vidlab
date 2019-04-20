import * as React from 'react';
import { TimelineMax } from "gsap";

/**
 * Does initial DOM manipulation to setup tweening for video annotations
 */
export const setupVideo = (
        videoRef: React.RefObject<HTMLVideoElement>,
        timeline: TimelineMax,
        setVideoHeight: (n: number) => void,
        setVideoWidth: (n: number) => void
    ) => () => {
    const video = videoRef.current;
    if (video !== null) {
        let loaded = false;
        setVideoHeight(video.clientHeight);
        setVideoWidth(video.clientWidth);
        video.addEventListener('canplay', () => {
            if (!loaded) {
                loaded = true;
                timeline.pause();
                setVideoHeight(video.clientHeight);
                setVideoWidth(video.clientWidth);

                video.onseeked = () => timeline.time(video.currentTime);
                video.ontimeupdate = () => timeline.time(video.currentTime);
            }
        });
    }
};
