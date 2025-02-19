document.getElementById('gifInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = function (e) {
            const gifImage = new Image();
            gifImage.onload = function () {
                createCanvas(gifImage);
            };
            gifImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function createCanvas(gifImage) {
    const canvas = document.getElementById('gifCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = gifImage.width;
    canvas.height = gifImage.height;
    
    ctx.drawImage(gifImage, 0, 0);
    
    // Cropping logic (you can customize the cropping area here)
    const cropWidth = 100; // Example width
    const cropHeight = 100; // Example height
    const cropX = 50; // Example x position
    const cropY = 50; // Example y position
    
    const imageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
    
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    croppedCtx.putImageData(imageData, 0, 0);
    
    createCroppedGif(croppedCanvas);
}

function createCroppedGif(croppedCanvas) {
    const gif = new GIF({
        workers: 2,
        quality: 10,
        width: croppedCanvas.width,
        height: croppedCanvas.height
    });
    
    gif.addFrame(croppedCanvas, {delay: 200});
    
    gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.addEventListener('click', function() {
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cropped.gif';
            a.click();
        });
    });
    
    gif.render();
}
