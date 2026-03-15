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
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M17.5 5.834v8.333c0 2.5-1.25 4.167-4.167 4.167H6.667c-2.917 0-4.167-1.667-4.167-4.167V5.834c0-2.5 1.25-4.167 4.167-4.167h6.666c2.917 0 4.167 1.667 4.167 4.167Z"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M12.917 1.667v6.55c0 .367-.434.55-.7.308l-1.934-1.783a.413.413 0 0 0-.566 0L7.783 8.525a.418.418 0 0 1-.7-.308v-6.55h5.834ZM11.042 11.667h3.541M7.5 15h7.083"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
