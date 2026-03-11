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
      strokeWidth={1.25}
      d="M17.292 12.709H.625M17.292 15.625v-4.167c0-1.571 0-2.357-.489-2.845-.488-.488-1.273-.488-2.845-.488h-10c-1.571 0-2.357 0-2.845.488S.625 9.887.625 11.458v4.167"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeWidth={1.25}
      d="M8.125 8.125V6.636c0-.317-.048-.423-.292-.548-.508-.26-1.126-.463-1.791-.463-.666 0-1.283.202-1.792.463-.244.125-.292.23-.292.548v1.489M13.958 8.125V6.636c0-.317-.047-.423-.292-.548-.508-.26-1.125-.463-1.791-.463-.665 0-1.283.202-1.791.463-.245.125-.292.23-.292.548v1.489"
    />
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeWidth={1.25}
      d="M16.458 8.125V4.259c0-.577 0-.865-.16-1.137s-.388-.413-.844-.695C13.614 1.291 11.374.625 8.958.625c-2.416 0-4.655.666-6.495 1.802-.456.282-.684.423-.845.695-.16.272-.16.56-.16 1.137v3.866"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
