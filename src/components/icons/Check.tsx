import * as React from "react";
import { SVGProps } from "react";
const Check = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="lucide lucide-check"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export default Check;
