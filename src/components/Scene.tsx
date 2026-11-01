export default function Scene({small=false}: {small?:boolean}) {
 return <svg className={`island-scene ${small?'small':''}`} viewBox="0 0 700 540" fill="none" role="img" aria-label="A tiny island where a sunlit coast meets pine-covered mountains">
 <defs>
 <linearGradient id="sea" x1="100" y1="290" x2="580" y2="480" gradientUnits="userSpaceOnUse"><stop stopColor="#b4dddb"/><stop offset="1" stopColor="#76b3b4"/></linearGradient>
 <linearGradient id="land" x1="340" y1="240" x2="340" y2="425" gradientUnits="userSpaceOnUse"><stop stopColor="#e9e7be"/><stop offset="1" stopColor="#c1cfad"/></linearGradient>
 <linearGradient id="mountain" x1="360" y1="140" x2="440" y2="340" gradientUnits="userSpaceOnUse"><stop stopColor="#a9beb2"/><stop offset="1" stopColor="#668d7e"/></linearGradient>
 <linearGradient id="sand" x1="270" y1="350" x2="300" y2="420" gradientUnits="userSpaceOnUse"><stop stopColor="#fae6b0"/><stop offset="1" stopColor="#ead39a"/></linearGradient>
 <filter id="shadow"><feGaussianBlur stdDeviation="18"/></filter>
 <filter id="soft"><feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#416c63" floodOpacity=".18"/></filter>
 </defs>
 <ellipse cx="355" cy="455" rx="235" ry="35" fill="#698e83" opacity=".15" filter="url(#shadow)"/>
 <circle cx="511" cy="116" r="43" fill="#f3da91"/><circle cx="511" cy="116" r="61" stroke="#f3da91" strokeOpacity=".25" strokeWidth="15"/>
 <g fill="#fff" opacity=".85"><path d="M98 167c0-14 13-24 27-21 6-23 41-25 50-4 21-2 29 13 26 25H98Z"/><path d="M445 199c0-12 12-20 23-18 4-18 29-22 39-4 18-3 28 9 25 22h-87Z"/></g>
 <path d="M91 353c18-63 137-101 264-98 143 3 269 54 274 117 5 62-115 115-263 117-142 2-292-57-275-136Z" fill="url(#sea)" filter="url(#soft)"/>
 <path d="M93 367c46 80 244 124 400 83 68-18 106-43 128-64-16 56-122 103-255 103-134 0-258-48-273-122Z" fill="#699f9d" opacity=".45"/>
 <g stroke="#e4f5ed" strokeWidth="3" strokeLinecap="round" opacity=".8"><path d="M129 366q30 17 56 12m-31 31q24 13 47 14m295-10q29-7 44-19m-125 63 32-3m-312-105 19 5"/></g>
 <path d="M167 337c13-57 93-90 174-96 74-6 180 30 200 80 25 61-78 110-180 110-101 0-206-41-194-94Z" fill="url(#sand)" filter="url(#soft)"/>
 <path d="M188 325c31-61 103-72 158-75 76-3 171 31 176 72 6 44-81 66-150 67-93 2-199-20-184-64Z" fill="url(#land)"/>
 <path d="M254 296 348 143q13-20 25 2l91 153c-70 29-138 26-210-2Z" fill="url(#mountain)"/>
 <path d="m348 143-12 111 37 53 91-9-91-153q-13-22-25-2Z" fill="#789b89" opacity=".65"/>
 <path d="m350 142-31 54 24-10 14 13 14-9 17 10-15-55q-11-21-23-3Z" fill="#e9efdc" opacity=".8"/>
 <path d="m204 306 66-112q13-17 23 2l63 120c-51 16-105 12-152-10Z" fill="#96b09a"/><path d="m274 194 8 115 74 7-63-120q-9-17-19-2Z" fill="#83a28a"/>
 <path d="M316 345q57-16 68 1t-35 33" stroke="#f4e9bf" strokeWidth="12" strokeLinecap="round"/>
 <g stroke="#476d5d" strokeWidth="5" strokeLinecap="round"><path d="M436 331v-56m44 71v-47m-248 27v-43m180 4v-41"/></g>
 <g fill="#416e5a"><path d="m436 242-23 42h12l-22 28h65l-22-28h12l-22-42Zm44 32-19 34h10l-19 24h56l-19-24h10l-19-34Zm-248-16-18 32h9l-17 23h52l-17-23h9l-18-32Zm180-36-16 29h8l-16 22h48l-16-22h8l-16-29Z"/></g>
 <g transform="translate(271 343) rotate(-9)" filter="url(#soft)"><rect width="49" height="39" rx="4" fill="#f9f4df"/><path d="m0 0 24 21L49 0" stroke="#d1c4a3" strokeWidth="2"/><path d="M20 19q4-7 8 0 6-2 4 4l-8 7-7-7q-2-6 3-4Z" fill="#b77d76"/></g>
 <g fill="#fff6d5"><circle cx="393" cy="348" r="4"/><circle cx="407" cy="356" r="3"/><circle cx="217" cy="339" r="3"/></g>
 <g stroke="#5a8176" strokeWidth="2" strokeLinecap="round"><path d="m151 227 8-3 8 3m10-24 6-2 6 2"/></g>
 <path d="m575 252 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" fill="#d3b66e"/>
 </svg>
}
