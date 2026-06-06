import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Upload } from 'lucide-react';
import { IconArrowRight } from './icons/PremiumIcons';
import { SAMPLE_IMAGES } from '../data/sampleImages';

export default function ImagePanel({
  imageUrl,
  selectedSampleId,
  isProcessing,
  apiStatus,
  onSampleSelect,
  onUpload,
  resolution = '640 × 640',
}) {
  const inputRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);

  useEffect(() => {
    if (!imageUrl) setImageDimensions(null);
  }, [imageUrl]);

  const handleImageLoad = (event) => {
    const img = event.currentTarget;
    setImageDimensions(`${img.naturalWidth} × ${img.naturalHeight}`);
  };

  useEffect(() => {
    const strip = thumbnailsRef.current;
    if (!strip) return undefined;

    const onWheel = (event) => {
      if (strip.scrollWidth <= strip.clientWidth) return;
      event.preventDefault();
      strip.scrollLeft += event.deltaY;
    };

    strip.addEventListener('wheel', onWheel, { passive: false });
    return () => strip.removeEventListener('wheel', onWheel);
  }, []);
  const hasImage = Boolean(imageUrl);
  const apiReady = apiStatus === 'online';

  const handleFile = (file) => {
    if (!apiReady || isProcessing) return;
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const openFilePicker = () => {
    if (!isProcessing && apiReady) inputRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!apiReady) return;
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isProcessing && apiReady) setIsDragging(true);
  };

  return (
    <div className="original-panel panel-original image-panel">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="original-panel__input"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <div className="original-panel__header image-panel-header">
        <h2 className="original-panel__title">Original Image</h2>
        <span className="original-panel__resolution">
          {imageDimensions ?? resolution}
        </span>
      </div>

      {hasImage ? (
        <div className="original-panel__viewport image-area">
          {isProcessing ? (
            <div className="skeleton original-panel__skeleton" aria-hidden="true" />
          ) : (
            <img
              src={imageUrl}
              alt="Road scene for detection"
              className="original-panel__img"
              onLoad={handleImageLoad}
            />
          )}
          {!isProcessing && (
            <button
              type="button"
              className="original-panel__replace"
              disabled={isProcessing || !apiReady}
              onClick={openFilePicker}
            >
              <RefreshCw size={12} aria-hidden="true" />
              Replace
            </button>
          )}
          {isProcessing && (
            <div className="original-panel__scanning">
              <div className="original-panel__scan-line" />
              <span className="original-panel__scanning-text image-placeholder-text">Scanning road scene…</span>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`original-panel__dropzone image-area ${isDragging ? 'original-panel__dropzone--drag' : ''} ${!apiReady ? 'original-panel__dropzone--disabled' : ''}`}
          role="button"
          tabIndex={apiReady ? 0 : -1}
          aria-disabled={!apiReady}
          onClick={openFilePicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFilePicker();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload size={24} className="original-panel__dropzone-icon" aria-hidden="true" />
          <p className="original-panel__dropzone-text">
            {!apiReady
              ? 'API offline — inferência indisponível'
              : isProcessing
                ? 'Processing...'
                : 'Drop image or click to upload'}
          </p>
          <p className="original-panel__dropzone-hint">PNG, JPG, WEBP up to 10MB</p>
        </div>
      )}

      <div className="original-panel__samples sample-images-strip">
        <span className="original-panel__samples-label">
          <IconArrowRight size={10} />
          Sample Images
        </span>
        <div className="original-panel__thumbnails-wrap">
          <div ref={thumbnailsRef} className="original-panel__thumbnails">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className={`thumbnail original-panel__thumb ${
                selectedSampleId === sample.id ? 'original-panel__thumb--selected' : ''
              }`}
              onClick={() => onSampleSelect(sample.id)}
              disabled={isProcessing || !apiReady}
              aria-label={`Sample: ${sample.label}`}
              title={sample.label}
            >
              <img src={sample.src} alt={sample.label} loading="lazy" />
            </button>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
