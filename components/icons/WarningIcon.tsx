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
    <g clipPath="url(#a)">
      <path
        fill="#F8BD00"
        d="M80 0C36 0 0 36 0 80s36 80 80 80 80-36 80-80S124 0 80 0Zm-6.286 34.286h12.572v62.857H73.714V34.286ZM80 131.429c-4.571 0-8.571-4-8.571-8.572 0-4.571 4-8.571 8.571-8.571s8.571 4 8.571 8.571c0 4.572-4 8.572-8.571 8.572Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h160v160H0z" />
      </clipPath>
    </defs>
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
