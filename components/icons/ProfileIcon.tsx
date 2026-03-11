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
      fill="#1A1A1A"
      d="M10 1.667a3.962 3.962 0 0 0-3.958 3.958c0 2.142 1.675 3.875 3.858 3.95a.672.672 0 0 1 .183 0H10.142a3.948 3.948 0 0 0 3.816-3.95A3.962 3.962 0 0 0 10 1.667ZM14.233 11.791c-2.325-1.55-6.116-1.55-8.458 0-1.058.709-1.642 1.667-1.642 2.692 0 1.025.584 1.975 1.634 2.675 1.166.783 2.7 1.175 4.233 1.175 1.533 0 3.067-.392 4.233-1.175 1.05-.708 1.634-1.658 1.634-2.692-.009-1.025-.584-1.975-1.634-2.675Z"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
