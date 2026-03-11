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
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M10.625 3.625h-2c-.943 0-1.414 0-1.707.293-.293.293-.293.764-.293 1.707v2c0 .943 0 1.414.293 1.707.293.293.764.293 1.707.293h2c.943 0 1.414 0 1.707-.293.293-.293.293-.764.293-1.707v-2c0-.943 0-1.414-.293-1.707-.293-.293-.764-.293-1.707-.293Z"
    />
    <path
      stroke="#1A1A1A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M11.125 9.625h-3v10h3v-10ZM5.625 19.625h8"
    />
    <path
      stroke="#1A1A1A"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M12.625 5.125h4a3 3 0 0 1 3 3v2.5h-3v-2.5h-4v-3Z"
    />
    <path
      stroke="#1A1A1A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M12.625.625h-5.4c-1.262 0-1.893 0-2.39.323-.497.323-.753.9-1.266 2.052L.625 9.625"
    />
    <path
      fill="#1A1A1A"
      d="m18.125 13.625.465-.417a.625.625 0 0 0-.93 0l.465.417Zm1.5 2.5H19a.875.875 0 0 1-.875.875v1.25a2.125 2.125 0 0 0 2.125-2.125h-.625Zm-1.5 1.5V17a.875.875 0 0 1-.875-.875H16c0 1.174.952 2.125 2.125 2.125v-.625Zm-1.5-1.5h.625c0-.05.034-.199.165-.454.121-.235.29-.494.468-.742a11.88 11.88 0 0 1 .694-.871l.01-.013a.05.05 0 0 1 .003-.002l-.465-.418-.465-.417-.002.002-.004.004-.014.016a7.14 7.14 0 0 0-.23.27c-.147.177-.344.424-.542.7a7.378 7.378 0 0 0-.564.899c-.15.291-.304.662-.304 1.026h.625Zm1.5-2.5-.465.417.003.003.01.013a6.708 6.708 0 0 1 .205.24c.135.162.313.386.49.631.178.248.346.507.467.742.131.255.165.403.165.454h1.25c0-.364-.154-.735-.303-1.026a7.39 7.39 0 0 0-.564-.9 13.097 13.097 0 0 0-.772-.969l-.015-.016-.004-.004-.001-.002-.466.417Z"
    />
    <path
      stroke="#1A1A1A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M9.625.625v3"
    />
  </svg>
)
const Memo = memo(SvgComponent)
export default Memo
