/**
 * The one SVG filter behind the hover-distortion effect (see
 * HoverDistort.tsx): a noise-driven ripple followed by a red/blue
 * channel split. Rendered once in the root layout; its strength is
 * animated by whichever element is currently being hovered, so it costs
 * nothing while nothing is hovered.
 */
export default function HoverDistortFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <filter id="hover-distort" x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
          <feTurbulence id="hover-distort-noise" type="fractalNoise" baseFrequency="0.008 0.03" numOctaves="1" seed="4" result="noise" />
          <feDisplacementMap id="hover-distort-map" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" result="warp" />
          <feColorMatrix in="warp" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feOffset id="hover-distort-r" in="red" dx="0" dy="0" result="redShift" />
          <feColorMatrix in="warp" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
          <feColorMatrix in="warp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
          <feOffset id="hover-distort-b" in="blue" dx="0" dy="0" result="blueShift" />
          <feBlend in="redShift" in2="green" mode="screen" result="redGreen" />
          <feBlend in="redGreen" in2="blueShift" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}
