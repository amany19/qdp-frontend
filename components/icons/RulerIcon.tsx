import * as React from "react"
import { SVGProps, memo } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.333}
      d="M12.666 8H14m-9.334 6v-1.333M8 14v-1.333m4.666-8H14"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={0.667}
      d="m10 10 3.807 3.807M10 10H2v4h11.333a.667.667 0 0 0 .667-.667V2h-4v8Z"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
