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
      d="M4 13.333 3.333 14M12 13.333l.667.667M2 8v.667c0 2.2 0 3.3.683 3.983.684.683 1.784.683 3.984.683h2.666c2.2 0 3.3 0 3.984-.683.683-.683.683-1.783.683-3.983V8M1.333 8h13.334m-12 0V3.682a1.682 1.682 0 0 1 3.295-.477L6 3.333M5.333 4 7 2.667"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
