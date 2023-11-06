import React, { useState } from "react";
import { Swiper } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ReactSlider = ({ children, NextRef, PrevRef }) => {
  return (
    <Swiper
      className="Swipper"
      style={{ height: "100%", width: "100%" }}
      modules={[Navigation]}
      navigation={{
        prevEl: PrevRef.current,
        nextEl: NextRef.current,
      }}
      spaceBetween={20}
      breakpoints={{
        1000: {
          slidesPerView: 5,
          spaceBetween: 15,
        },

        750: {
          slidesPerView: 4,
          spaceBetween: 15,
        },

        550: {
          slidesPerView: 2,
          spaceBetween: 15,
        },

        250: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
      }}
      slidesPerView={4}
      pagination={{ clickable: true }}
      onBeforeInit={(swip) => {
        swip.params.navigation.prevEl = PrevRef.current;
        swip.params.navigation.nextEl = NextRef.current;
      }}
    >
      {children}
    </Swiper>
  );
};

export default ReactSlider;
