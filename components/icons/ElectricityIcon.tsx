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
      strokeWidth={1.5}
      d="M16.104 10.41c-.383.45-1.09.454-1.537.007l-4.484-4.483c-.447-.447-.443-1.155.007-1.538l1.231-1.047a6.49 6.49 0 0 1 3.133-1.448l.725-.122c.685-.116 1.405.123 1.918.637l.987.987c.514.513.753 1.233.637 1.918l-.122.725a6.49 6.49 0 0 1-1.448 3.133l-1.047 1.231Z"
    />
    <path
      stroke="#1A1A1A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m17.75 2.75 2-2M.75 19.75l2-2"
    />
    <path
      stroke="#1A1A1A"
      strokeWidth={1.5}
      d="M4.396 10.09c.383-.45 1.09-.454 1.538-.007l4.483 4.483c.447.447.444 1.155-.007 1.538l-1.231 1.047a6.49 6.49 0 0 1-3.133 1.448l-.725.122c-.685.116-1.405-.123-1.918-.637l-.987-.986c-.514-.514-.753-1.234-.637-1.919l.122-.725a6.49 6.49 0 0 1 1.448-3.133l1.047-1.231Z"
    />
    <path
      stroke="#1A1A1A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m6.75 10.75 2-2m1 5 2-2"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
