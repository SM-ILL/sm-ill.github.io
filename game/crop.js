document.getElementById('gifInput').addEventListener('change', handleFileSelect);

const canvas = document.getElementById('gifCanvas');
const ctx = canvas.getContext('2d');
const selectionBox = document.getElementById('selectionBox');
let startX, startY, isSelecting = false;

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = function (e) {
            const gifImage = new Image();
            gifImage.onload = function () {
                canvas.width = gifImage.width;
                canvas.height = gifImage.height;
                ctx.drawImage(gifImage, 0, 0);
            };
            gifImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

canvas.addEventListener('mousedown', function (e) {
    startX = e.offsetX;
    startY = e.offsetY;
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';
    isSelecting = true;
});

canvas.addEventListener('mousemove', function (e) {
    if (isSelecting) {
        const currentX = e.offsetX;
        const currentY = e.offsetY;
        const width = currentX - startX;
        const height = currentY - startY;
        selectionBox.style.width = `${Math.abs(width)}px`;
        selectionBox.style.height = `${Math.abs(height)}px`;
        selectionBox.style.left = `${width < 0 ? currentX : startX}px`;
        selectionBox.style.top = `${height < 0 ? currentY : startY}px`;
    }
});

canvas.addEventListener('mouseup', function () {
    isSelecting = false;
});

document.getElementById('cropBtn').addEventListener('click', function () {
    const rect = selectionBox.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const cropX = rect.left - canvasRect.left;
    const cropY = rect.top - canvasRect.top;
    const cropWidth = rect.width;
    const cropHeight = rect.height;

    if (cropWidth > 0 && cropHeight > 0) {
        const imageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        croppedCtx.putImageData(imageData, 0, 0);

        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: cropWidth,
            height: cropHeight
        });

        gif.addFrame(croppedCanvas, { delay: 200 });

        gif.on('finished', function (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cropped.gif';
            a.click();
        });

        gif.render();
    }
});
