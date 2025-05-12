// src/shared/ui/CustomToastContainer/CustomToastContainer.tsx
import { ToastContainer, ToastContainerProps } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TypeOptions } from "react-toastify";

const CustomToastContainer = () => {
  const toastClassName: ToastContainerProps["toastClassName"] = (
    context
  ) => {
    const type = (context as { type?: TypeOptions })?.type;
    return [
      "app-toast__container",
      type && `app-toast__container--${type}`,
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
      toastClassName={toastClassName}
      {...{
        bodyClassName: "app-toast__body",
        progressClassName: "app-toast__progress",
      }}
    />
  );
};

export default CustomToastContainer;
