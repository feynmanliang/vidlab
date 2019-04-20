import { TimelineMax, TweenMax } from "gsap";

const video = document.createElement("video");

window.onresize = () => {
//  video.setAttribute('height', `${window.innerHeight}px`);
  video.setAttribute('width', `${window.innerWidth}px`);
  console.log('hey');
};

// video.setAttribute('height', `${window.innerHeight}px`);
video.setAttribute('width', `${window.innerWidth}px`);
video.setAttribute('controls', 'true');

const src = document.createElement("source");

src.setAttribute("src", "./test_vid2.mp4");
src.setAttribute("type", "video/mp4");
video.appendChild(src);

document.body.appendChild(video);

const tracks = [
  {
    keyframes: [
      {
        time: 0,
        visible: true,
        bbox: [800, 100, 850, 50] // top, right, bottom, left
      },
      {
        time: 3,
        visible: true,
        bbox: [1400, 200, 1650, 100] // top, right, bottom, left
      },
      {
        time: 6,
        visible: false,
        bbox: [1400, 200, 1650, 100] // top, right, bottom, left
      }
    ]
  }
];

var loaded = false;

video.oncanplay = () => {
  if (!loaded) {
    loaded = true;

    tracks.forEach(track => {
      const box = document.createElement("div");
      box.setAttribute("class", "box");

      const timeline = new TimelineMax();
      timeline.pause();

      video.onplay = () => timeline.play();
      video.onpause = () => timeline.pause();
      video.onseeked = () => timeline.time(video.currentTime);
      video.ontimeupdate = () => timeline.time(video.currentTime);

      track.keyframes.forEach((keyframe, i) => {
        const [top, right, bottom, left] = keyframe.bbox;
        document.body.appendChild(box);

        const prevKeyframeTime = i === 0 ? 0 : track.keyframes[i - 1].time;

        if (!keyframe.visible) {
          timeline.add(
            TweenMax.to(box, 0, {
              opacity: 0.0
            }),
            keyframe.time
          );
        } else {
          timeline.add(
            TweenMax.to(box, keyframe.time - prevKeyframeTime, {
              opacity: 1.0,
              top: `${top}px`,
              left: `${left}px`,
              width: `${right - left}px`,
              height: `${bottom - top}px`
            }),
            prevKeyframeTime
          );
        }
      });
    });
  }
};
