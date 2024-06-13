import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const MultiButton: React.FC<ButtonProps> = ({ children, onClick, ...props }) => {
  return (
    <div className="w-full">
      <button
        {...props}
        type="button"
        className="w-full justify-center text-md flex items-center gap-2 rounded-full px-4 py-3 font-robotoMono uppercase hover:font-bold lg:px-6 lg:py-5 bg-black text-white"
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

export default MultiButton;