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
      fill="#FEDC00"
      d="M6.484.691c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.691h3.462c.968 0 1.371 1.24.588 1.809l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.299.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.196-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118l-2.8-2.034c-.784-.57-.38-1.809.588-1.809h3.461a1 1 0 0 0 .951-.691L6.484.691Z"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
