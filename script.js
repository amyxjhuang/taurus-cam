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
    console.log("Starting to run");
    const model = await blazeface.load();
    const webcam = await setupWebcam();
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');

    const gridSize = 17;
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    let previousGridX = -1;
    let previousGridY = -1;

    while (true) {
        const predictions = await model.estimateFaces(webcam, false);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach(prediction => {
            const start = prediction.topLeft;
            const end = prediction.bottomRight;
            const centerX = (start[0] + end[0]) / 2;
            const centerY = (start[1] + end[1]) / 2;

            // Calculate grid position
            const gridX = Math.floor(centerX / cellWidth);
            const gridY = Math.floor(centerY / cellHeight);

            // Print the grid coordinates
            // console.log(`Face is at grid position: (${gridX}, ${gridY})`);

            // Update the image only if the grid position has changed
            if (gridX !== previousGridX || gridY !== previousGridY) {
                displayImageDynamically(gridX, gridY);
                previousGridX = gridX;
                previousGridY = gridY;
            }

            // Draw the bounding box
            ctx.beginPath();
            ctx.rect(start[0], start[1], end[0] - start[0], end[1] - start[1]);
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

function displayImageDynamically(gridX, gridY) {
    const imageContainer = document.getElementById('imageContainer');

    const indexFromCoords = 7272 + gridY * 17 + gridX;
    const img = document.createElement('img');
    img.src = 'chess/original/IMG_' + indexFromCoords + '.JPG'; // Path to your image
    img.alt = 'Dynamic Image';
    img.width = 640; // Set desired width
    img.height = 480; // Set desired height

    // Add the new image to the container
    imageContainer.appendChild(img);

    // Use a timeout to ensure the image is added to the DOM before applying the class
    setTimeout(() => {
        img.classList.add('visible');
    }, 10); // Small delay to trigger the transition

    // Remove the previous image after the transition
    const previousImage = imageContainer.querySelector('img:not(.visible)');
    if (previousImage) {
        console.log("REmoving previous image")
        previousImage.addEventListener('transitionend', () => {
            previousImage.remove();
        });
    }
}
run(); 