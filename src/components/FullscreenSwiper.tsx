import React, { useEffect, useRef, useState } from "react";
import { Link, f7 } from "framework7-react";

const FullscreenSwiper = () => {
  const [images, setImages] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  const handleShowFullscreenSwiper = ({ sources, currentIndex }) => {
    setImages(sources);
    setStartIndex(currentIndex);
  };
  const handleHideFullscreenSwiper = () => {
    setImages([]);
    setStartIndex(0);
  };

  useEffect(() => {
    f7.on("showFullscreenSwiper", handleShowFullscreenSwiper);

    return () => {
      f7.off("showFullscreenSwiper", handleShowFullscreenSwiper);
    };
  }, []);

  return images.length > 0 ? (
    <>
      <div id="fullscreen-swiper" className="safe-areas">
        <Link iconF7="xmark_circle_fill" onClick={handleHideFullscreenSwiper} />
        <swiper-container
          css-mode={true}
          loop={true}
          pagination={true}
          initial-slide={startIndex}
          space-between={5}
        >
          {images.map((src: string, i: number) => (
            <swiper-slide key={i} className="swiper-slide-custom">
              <div
                className="image-container"
                style={{ backgroundImage: `url(${src})` }}
              ></div>
            </swiper-slide>
          ))}
        </swiper-container>
      </div>
    </>
  ) : null;
};

export default FullscreenSwiper;
