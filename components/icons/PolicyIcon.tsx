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
      strokeMiterlimit={10}
      d="M3.058 2.083v9.976A2.6 2.6 0 0 0 4.1 14.142l4.342 3.25c.925.692 2.2.692 3.125 0l4.341-3.25a2.6 2.6 0 0 0 1.042-2.083V2.082H3.058Z"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M1.667 2.083h16.666"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      d="M6.667 6.667h6.666M6.667 10.834h6.666"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
