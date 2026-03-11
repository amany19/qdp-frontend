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
      strokeWidth={1.25}
      d="m21 14.25-.831-.659c-.946-.75-1.419-1.125-1.419-1.591 0-.466.473-.841 1.419-1.591L21 9.75m-18 0 .831.659c.946.75 1.419 1.125 1.419 1.591 0 .466-.473.841-1.419 1.591L3 14.25M14.572 21l.156-1.059c.178-1.205.267-1.807.674-2.042.407-.236.972-.011 2.104.437l.994.394M9.428 3l-.156 1.059c-.178 1.205-.267 1.807-.674 2.042-.407.236-.972.011-2.104-.437L5.5 5.27M5 18.732l1.07-.395c1.218-.448 1.827-.672 2.265-.438.438.235.533.838.724 2.042L9.227 21M19 5.268l-1.07.394c-1.218.45-1.828.673-2.265.439-.438-.235-.533-.838-.724-2.042L14.773 3"
    />
    <path
      stroke="#1A1A1A"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M19 12H5m10.5 6-7-12m7 0-7 12"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
