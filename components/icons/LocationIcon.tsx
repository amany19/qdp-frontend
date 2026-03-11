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
      fill="#666"
      d="M8 9.447a2.576 2.576 0 1 1 0-5.153 2.576 2.576 0 1 1 0 5.153Zm0-4.154a1.58 1.58 0 1 0-.002 3.162A1.58 1.58 0 0 0 8 5.293Z"
    />
    <path
      fill="#666"
      d="M8 15.174a3.98 3.98 0 0 1-2.753-1.114c-1.967-1.893-4.14-4.913-3.32-8.507C2.667 2.293 5.513.833 8 .833h.007c2.486 0 5.333 1.46 6.073 4.727.813 3.593-1.36 6.607-3.327 8.5A3.98 3.98 0 0 1 8 15.174Zm0-13.34c-1.94 0-4.433 1.033-5.093 3.94-.72 3.14 1.253 5.846 3.04 7.56a2.95 2.95 0 0 0 4.113 0c1.78-1.714 3.753-4.42 3.046-7.56C12.44 2.867 9.94 1.834 8 1.834Z"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
