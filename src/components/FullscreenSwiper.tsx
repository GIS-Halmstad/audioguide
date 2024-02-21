import React, { useEffect, useState } from "react";
import { Link, f7 } from "framework7-react";

const FullscreenSwiper = () => {
  const [images, setImages] = useState([]);
  const handleShowFullscreenSwiper = (sources: string[]) => {
    setImages(sources);
  };
  const handleHideFullscreenSwiper = () => {
    setImages([]);
  };

  useEffect(() => {
    console.log("ON");
    f7.on("showFullscreenSwiper", handleShowFullscreenSwiper);

    return () => {
      console.log("OFF");
      f7.off("showFullscreenSwiper", handleShowFullscreenSwiper);
    };
  }, []);
  console.log("RENDER");

  return images.length > 0 ? (
    <>
      <div id="fullscreen-swiper" className="safe-areas">
        <Link iconF7="xmark_circle_fill" onClick={handleHideFullscreenSwiper} />
        <swiper-container cssMode="true" pagination space-between="0">
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
