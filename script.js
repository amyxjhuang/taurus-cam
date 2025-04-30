// Import TensorFlow.js and the face detection model
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

async function setupWebcam() {
    const webcamElement = document.getElementById('webcam');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcamElement.srcObject = stream;
    return new Promise((resolve) => {
        webcamElement.onloadedmetadata = () => {
            resolve(webcamElement);
        };
    });
}

async function run() {
    const model = await blazeface.load();
    const webcam = await setupWebcam();
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');

    while (true) {
        const predictions = await model.estimateFaces(webcam, false);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach(prediction => {
            const start = prediction.topLeft;
            const end = prediction.bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];

            // Draw the bounding box
            ctx.beginPath();
            ctx.rect(start[0], start[1], size[0], size[1]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.stroke();

            // Draw the face landmarks
            const landmarks = prediction.landmarks;
            landmarks.forEach(landmark => {
                ctx.beginPath();
                ctx.arc(landmark[0], landmark[1], 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.fill();
            });
        });

        await tf.nextFrame();
    }
}

run(); 