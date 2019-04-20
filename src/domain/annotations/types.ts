export type Annotation = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  timestamp: number;
  visible: boolean;
};

export type AnnotatedObject = {
  id: string;
  heightPx: number;
  widthPx: number;
  videoId: string;
  annotations: Annotation[];
};
