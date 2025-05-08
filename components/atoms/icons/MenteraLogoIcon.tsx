import * as React from "react";

export const MenteraLogoIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (props, ref) => (
    <svg
      ref={ref}
      width="38"
      height="41"
      viewBox="0 0 38 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16.2712 32.858C25.2575 32.858 32.5423 25.5751 32.5423 16.5913C32.5423 7.60735 25.2575 0.324463 16.2712 0.324463C7.28484 0.324463 0 7.60735 0 16.5913C0 25.5751 7.28484 32.858 16.2712 32.858Z"
        fill="url(#paint0_linear_163_1150)"
      />
      <path
        d="M21.4089 40.3245C30.3952 40.3245 37.68 33.0416 37.68 24.0576C37.68 15.0738 30.3952 7.79089 21.4089 7.79089C12.4226 7.79089 5.1377 15.0738 5.1377 24.0576C5.1377 33.0416 12.4226 40.3245 21.4089 40.3245Z"
        fill="url(#paint1_linear_163_1150)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_163_1150"
          x1="32.4564"
          y1="14.8892"
          x2="0.0967008"
          y2="18.3313"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="0.94" stopColor="#8F03A0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_163_1150"
          x1="37.5932"
          y1="22.3547"
          x2="5.23348"
          y2="25.7967"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6EF1BB" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  ),
);

MenteraLogoIcon.displayName = "MenteraLogoIcon";
