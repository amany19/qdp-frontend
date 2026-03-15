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
      d="M15.883 15.558 14.1 12l-1.783 3.558"
    />
    <path fill="#333" d="M12.642 14.925h2.933Z" />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12.642 14.925h2.933M14.1 18.333a4.234 4.234 0 1 1 .001-8.468 4.234 4.234 0 0 1-.001 8.468ZM4.183 1.667H7.45c1.725 0 2.558.833 2.517 2.516V7.45c.041 1.725-.792 2.558-2.517 2.517H4.183C2.5 10 1.667 9.167 1.667 7.44V4.175c0-1.675.833-2.508 2.516-2.508Z"
    />
    <path fill="#333" d="M7.508 4.875H4.125Z" />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.508 4.875H4.125"
    />
    <path fill="#333" d="M5.808 4.308v.567Z" />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.808 4.308v.567M6.658 4.867c0 1.458-1.141 2.641-2.541 2.641"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.508 7.508c-.608 0-1.158-.325-1.541-.841M1.667 12.5A5.829 5.829 0 0 0 7.5 18.333l-.875-1.458M18.333 7.5A5.829 5.829 0 0 0 12.5 1.667l.875 1.458"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
