import React from 'react';
import '../index.css';

const OpenClose = ({ toggleSidebar }) => {
  return (
    <div className="openClose">
      <img 
        src="../public/OC.png" 
        alt="openclose Button"
        className="openCloseBtn"
        onClick={toggleSidebar}
      />
    </div>
  );
}

export default OpenClose;
