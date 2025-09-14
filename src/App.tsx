import React, { useState, useRef, useEffect } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import originalPoster from "./image.png";

const App = () => {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(
    null
  );
  const [enteredName, setEnteredName] = useState("");
  const posterRef = useRef<HTMLImageElement | null>(null);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = originalPoster;
    img.onload = () => {
      posterRef.current = img;
      setPosterLoaded(true);
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        if (e.target?.result && typeof e.target.result === "string") {
          img.src = e.target.result;
          img.onload = () => {
            setUploadedImage(img);
            setShowCropper(true);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(
      centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 90,
          },
          1 / 1,
          width,
          height
        ),
        width,
        height
      )
    );
  }

  const handleApplyCrop = () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    const pixelRatio = window.devicePixelRatio;
    const dWidth = completedCrop.width * scaleX;
    const dHeight = completedCrop.height * scaleY;
    canvas.width = dWidth * pixelRatio;
    canvas.height = dHeight * pixelRatio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      dWidth,
      dHeight,
      0,
      0,
      dWidth,
      dHeight
    );

    const croppedImageUrl = canvas.toDataURL("image/png");
    const croppedImg = new Image();
    croppedImg.src = croppedImageUrl;
    croppedImg.onload = () => {
      setUploadedImage(croppedImg);
      setShowCropper(false);
      setCompletedCrop(undefined);
    };
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnteredName(event.target.value);
  };

  const handleDownload = () => {
    if (!uploadedImage || !posterLoaded) {
      console.log("Please upload and crop an image first.");
      return;
    }

    if (!posterRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = posterRef.current.naturalWidth;
    canvas.height = posterRef.current.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(posterRef.current, 0, 0);

    const posterWidth = posterRef.current.naturalWidth;
    const posterHeight = posterRef.current.naturalHeight;
    const circleSize = posterWidth * (180 / 490);
    const imageX = posterWidth * (212 / 530);
    const imageY = posterHeight * 0.59;

    ctx.save();
    ctx.beginPath();
    ctx.arc(imageX, imageY, circleSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const drawX = imageX - circleSize / 2;
    const drawY = imageY - circleSize / 2;

    ctx.drawImage(uploadedImage, drawX, drawY, circleSize, circleSize);
    ctx.restore();

    const textY = posterHeight * 0.77;
    ctx.fillText(enteredName, imageX, textY);
    ctx.font = "bold 106px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(enteredName, imageX, textY);

    const link = document.createElement("a");
    link.download = "sweet of madeena 2025.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <div
        className="flex flex-col items-center justify-center p-4 min-h-screen bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 109, 33, 0.41)), url(${originalPoster})`,
        }}
      >
        {/* Cropper Modal */}
        {showCropper && uploadedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-xl w-full">
              <h2 className="text-xl font-bold mb-4">
                Crop Your Image (1:1 Ratio)
              </h2>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1 / 1}
              >
                <img
                  ref={imgRef}
                  src={uploadedImage.src}
                  onLoad={onImageLoad}
                  alt="To be cropped"
                />
              </ReactCrop>
              <button
                onClick={handleApplyCrop}
                className="mt-4 w-full p-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
              >
                Apply Crop
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 p-6 backdrop-blur-xl border border-black border-opacity-30 rounded-[3vh] shadow-lg ring-1 ring-white/50 w-full max-w-sm">
          <label htmlFor="name-input" className="font-bold text-white">
            Enter Name:
          </label>
          <input
            id="name-input"
            type="text"
            value={enteredName}
            onChange={handleNameChange}
            placeholder="Your Name"
            className="p-3 border text-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <label
            htmlFor="image-upload-control"
            className="p-3 text-center bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition duration-300 shadow-md"
          >
            Upload New Image
          </label>
          <input
            id="image-upload-control"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={handleDownload}
            className="p-3 text-center bg-green-500 text-white font-bold rounded-lg cursor-pointer hover:bg-green-600 transition duration-300 shadow-md disabled:bg-gray-400"
            disabled={!uploadedImage}
          >
            Download Poster
          </button>
        </div>
      </div>
      <footer className="text-center text-white bg-black p-2  ">
        Web by{" "}
        <a
          href="https://linkedin.com/in/shad-c-t"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Shad-CT
        </a>
      </footer>
    </>
  );
};

export default App;
