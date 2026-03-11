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
      stroke="#1A1A1A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15.75 5.75h-15M11.75 10.75l4.293-4.293c.333-.333.5-.5.5-.707 0-.207-.167-.374-.5-.707L11.75.75"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
