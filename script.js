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

            // Update the image only if the grid position has changed
            if (gridX !== previousGridX || gridY !== previousGridY) {
                displayImageDynamically(gridX, gridY);
                previousGridX = gridX;
                previousGridY = gridY;
                console.log(`(${gridX}, ${gridY})`);

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
    let y = 16-gridY >= 10 ? `${16-gridY}` : `0${16-gridY}`  ;
    // let x = 16-gridX >= 10 ? `${16-gridX}` : `0${16-gridX}`  ;
    let x = gridX >=10 ? `${gridX}` : `0${gridX}`;
    console.log(`(${x}, ${y})`);
    const img = document.createElement('img');

    // Uncomment if using original dataset
    // const indexFromCoords = 7272 + y * 17 + x;
    // img.src = 'chess/original/IMG_' + indexFromCoords + '.JPG'; // Path to your image

    img.src = 'chess/rectified/out_' + y + '_' + x + '.png'; // Path to your image

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
        // console.log("REmoving previous image")
        previousImage.addEventListener('transitionend', () => {
            previousImage.remove();
        });
    }
}


// let activeContainerId = 'imageContainer1';

// document.getElementById('toggleButton').addEventListener('click', () => {
//     // Toggle the active container
//     if (activeContainerId === 'imageContainer1') {
//         activeContainerId = 'imageContainer2';
//     } else {
//         activeContainerId = 'imageContainer1';
//     }

//     // Update the display of the containers
//     // document.getElementById('imageContainer1').style.display = activeContainerId === 'imageContainer1' ? 'block' : 'none';
//     // document.getElementById('imageContainer2').style.display = activeContainerId === 'imageContainer2' ? 'block' : 'none';

//     console.log(`Active container: ${activeContainerId}`);
// });

run();

document.getElementById('fullscreenToggle').addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    const imageContainer = document.getElementById('imageContainer');
    if (!document.fullscreenElement) {
        imageContainer.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
} 