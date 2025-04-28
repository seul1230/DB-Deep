import React from "react";
import loginLeftSide from "../../assets/loginLeftSide.png";

const BackgroundImage: React.FC = () => {
  return (
    <div className="backgroundimage-left">
      <img src={loginLeftSide} alt="Login Left Side" className="backgroundimage-img" />
    </div>
  );
};

export default BackgroundImage;
