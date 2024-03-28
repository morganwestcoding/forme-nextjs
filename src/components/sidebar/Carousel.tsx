import React, { useState } from 'react';
import './Carousel.css'; // Make sure the path matches where you save your CSS file

const Carousel = () => {
  const [currDeg, setCurrDeg] = useState(0);

  const rotate = (direction: 'n' | 'p') => {
    setCurrDeg(currDeg + (direction === 'n' ? -60 : 60));
  };

  return (
    <div className="container">
      <div className="carousel" style={{ transform: `rotateY(${currDeg}deg)` }}>
        <div className="item a">A</div>
        <div className="item b">B</div>
        <div className="item c">C</div>
        <div className="item d">D</div>
        <div className="item e">E</div>
        <div className="item f">F</div>
        <div className="item e">G</div>
        <div className="item f">H</div>
      </div>
      <div className="next" onClick={() => rotate('n')}>Next</div>
      <div className="prev" onClick={() => rotate('p')}>Prev</div>
    </div>
  );
};

export default Carousel;
