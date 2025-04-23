import * as faceapi from 'face-api.js';

const loadModels = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector');
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models/ssd_mobilenetv1');
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(
    '/models/face_landmark_68_tiny'
  );
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models/face_recognition');
  await faceapi.nets.tinyYolov2.loadFromUri(
    '/models/tiny_yolov2_separable_conv'
  );
};
export const detectFace = async (imageElement) => {
  await loadModels();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const detectorOptions = isMobile
    ? new faceapi.TinyFaceDetectorOptions({
        scoreThreshold: 0.3,
      })
    : new faceapi.SsdMobilenetv1Options();
  const detections = await faceapi
    .detectAllFaces(imageElement, detectorOptions)
    .withFaceLandmarks(true)
    .withFaceDescriptors();
  return detections;
};
