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
      strokeWidth={0.667}
      d="M1.333 8h13.334m-1.334 0v5.333A1.333 1.333 0 0 1 12 14.667H4a1.334 1.334 0 0 1-1.333-1.334V8m0-2.667 10.666-2.666M5.907 4.52l-.3-1.207a1.333 1.333 0 0 1 .966-1.62l1.294-.32a1.333 1.333 0 0 1 1.62.974l.3 1.2"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
