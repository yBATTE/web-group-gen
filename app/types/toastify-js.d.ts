declare module "toastify-js" {
  type ToastifyOptions = {
    text?: string;
    duration?: number;
    gravity?: "top" | "bottom";
    position?: "left" | "center" | "right";
    close?: boolean;
    stopOnFocus?: boolean;
    style?: Record<string, string>;
  };

  interface ToastifyInstance {
    showToast(): void;
    hideToast(): void;
  }

  function Toastify(options?: ToastifyOptions): ToastifyInstance;
  export default Toastify;
}
