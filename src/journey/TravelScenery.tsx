import { useId } from 'react'

type TravelSceneryProps = { progress: number; reducedMotion: boolean }
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const ease = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

/** All movement is a pure, reversible function of the parent's scroll progress. */
export default function TravelScenery({ progress, reducedMotion }: TravelSceneryProps) {
  const id = useId().replace(/:/g, '')
  const p = Number.isFinite(progress) ? clamp(progress) : 0
  const arrival = ease(p, .82, .95)
  const travel = ease(p, .12, .24) * (1 - arrival)
  const mountain = ease(p, .32, .49) * (1 - ease(p, .63, .76))
  const coast = ease(p, .62, .75)
  // Slower progress through the mountains, then deceleration before the gift.
  const distance = reducedMotion ? 0 : Math.min(p, .48) * 1.8 + clamp((p - .48) / .2) * .12 + ease(p, .68, .88) * .3
  const shift = reducedMotion ? 0 : (p - .45) * 36
  const pineId = `${id}-pine`
  return <div className="travel-scenery" aria-hidden="true" data-reduced={reducedMotion} data-travel={travel.toFixed(3)} data-mountains={mountain.toFixed(3)} data-coast={coast.toFixed(3)} style={{ opacity: travel }}>
    <svg className="travel-scenery__art" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#d9e4df" /><stop offset=".6" stopColor="#f1f0df" /><stop offset="1" stopColor="#d2d8bf" /></linearGradient>
        <linearGradient id={`${id}-cool`} x2="0" y2="1"><stop stopColor="#b9d1d2" /><stop offset=".65" stopColor="#e1e8df" /><stop offset="1" stopColor="#a9bcb1" /></linearGradient>
        <linearGradient id={`${id}-warm`} x2="0" y2="1"><stop stopColor="#eadac2" /><stop offset=".53" stopColor="#f5ead2" /><stop offset="1" stopColor="#d7c59e" /></linearGradient>
        <linearGradient id={`${id}-sea`} x2="0" y2="1"><stop stopColor="#8eafb0" /><stop offset="1" stopColor="#568b8c" /></linearGradient>
        <linearGradient id={`${id}-mist`} x2="0" y2="1"><stop stopColor="#eff3e9" stopOpacity="0" /><stop offset=".5" stopColor="#eff3e9" stopOpacity=".85" /><stop offset="1" stopColor="#eff3e9" stopOpacity="0" /></linearGradient>
        <g id={pineId}><path d="M0 0 18 34 10 31 29 58 18 55 38 86 22 81 47 116 7 108 7 137-7 137-7 108-47 116-22 81-38 86-18 55-29 58-10 31-18 34Z" /><path d="M0 28 0 134" stroke="#d7dfca" strokeWidth="1.5" opacity=".2" /></g>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0h1600v1000H0z" />
      <path fill={`url(#${id}-cool)`} opacity={mountain} d="M0 0h1600v1000H0z" />
      <path fill={`url(#${id}-warm)`} opacity={coast} d="M0 0h1600v1000H0z" />
      <circle cx="1195" cy="253" r="64" fill="#fff8e1" opacity={.5 - mountain * .3} />
      <g fill="#fbfcf3" opacity=".6" transform={`translate(${-shift * 1.3} ${shift * .18})`}>
        <path d="M155 225c65-36 113-34 152-13 34-49 110-48 145-6 58-21 113-11 157 19Z" />
        <path d="M1090 161c43-25 78-22 108-8 43-38 101-30 124 7 43-11 87-2 117 15l-349-2Z" />
        <path d="M755 302c39-16 58-14 81-5 32-31 72-27 96 2 24-7 60-3 84 11H755Z" />
      </g>
      <g transform={`translate(${shift * .3} ${-distance * 9}) scale(${1 + distance * .025})`} style={{ transformOrigin: '960px 440px' }}>
        <path d="M-120 505 38 425 151 451 292 358 410 408 540 320 674 386 800 330 916 408 1069 317 1202 393 1328 348 1508 431 1740 365V1000H-120Z" fill="#a2b4a6" opacity={.6 + mountain * .15} />
        <path d="M-120 575 48 493 218 527 406 427 528 483 706 418 852 481 1010 401 1179 477 1385 403 1740 526V1000H-120Z" fill="#7f9b89" />
      </g>
      <g opacity={1 - coast}>
        <g transform={`translate(${-shift} ${distance * 19}) scale(${1 + distance * .08})`} style={{ transformOrigin: '960px 450px' }}>
          <path d="M-150 616C45 470 158 570 336 529S620 455 815 517Q953 556 1125 502T1740 516V1100H-150Z" fill="#5b7d67" />
          <path d="M-150 760Q82 615 270 677T592 609Q793 555 959 561 1190 517 1370 630T1740 661V1100H-150Z" fill="#81936e" />
          <path d="M-150 900Q160 716 398 782T782 668L976 550Q1312 669 1740 805V1100H-150Z" fill="#9ba17b" />
        </g>
        <g opacity={1 - ease(p, .62, .77)}>
          <path d="M950 455C936 546 1149 582 1141 682S1010 872 1500 1050H644C906 878 1082 774 1070 684S915 552 950 455Z" fill="#b2ad94" />
          <path d="M950 455C946 543 1120 584 1109 684S1038 874 1281 1050H853C990 883 1116 778 1109 684S929 543 950 455Z" fill="#64716a" />
          <path d="M950 464C941 550 1119 583 1109 684S1038 875 1092 1050" fill="none" stroke="#f4ead0" strokeWidth="3" opacity=".75" />
          {/* Perspective markers accelerate outward; no timer or looping animation. */}
          {Array.from({ length: 16 }, (_, index) => {
            const depth = ((index / 16 + distance * .53) % 1)
            const y = 470 + depth * depth * 620
            const x = 952 + Math.sin(depth * 3.2) * 180
            return <path key={index} d={`M${x + depth * 39} ${y}l${depth * 17} ${5 + depth * 23}`} stroke="#f0e9cf" strokeWidth={1 + depth * 4} opacity={Math.min(1, depth * 4)} />
          })}
        </g>
        <g fill="#335d50" opacity={mountain}>
          {Array.from({ length: 22 }, (_, index) => {
            const side = index % 2 ? 1 : -1
            const depth = (index / 22 + distance * .21) % 1
            const scale = .16 + depth * depth * 2.6
            const x = 960 + side * (85 + depth * depth * 920)
            const y = 465 + depth * depth * 590
            return <use key={index} href={`#${pineId}`} opacity={Math.min(1, depth * 5)} transform={`translate(${x} ${y - scale * 137}) scale(${scale})`} />
          })}
        </g>
      </g>
      <g opacity={coast}>
        <path d="M-50 488Q510 478 1650 488V1050H-50Z" fill={`url(#${id}-sea)`} />
        <path d="M-50 714Q330 691 759 781T1650 882V1050H-50Z" fill="#d8c8a6" />
        <path d="M-50 730Q330 705 759 795T1650 897" stroke="#f4efdc" strokeWidth="13" fill="none" opacity=".75" />
        <g fill="none" stroke="#e9efe0" transform={`translate(${-shift * 1.2} ${distance * 7})`}>
          <path d="M-90 534Q400 522 847 536T1720 531M-90 578Q350 562 758 580T1710 574" opacity=".42" />
          <path d="M-90 638Q280 614 760 655T1710 676" strokeWidth="2" opacity=".55" />
          <path d="M-90 678Q300 650 770 707T1710 752" strokeWidth="3" opacity=".7" />
          <path d="M-90 762Q310 733 780 829T1710 925" strokeWidth="2" opacity=".45" />
        </g>
        <path d="M-40 488Q116 445 210 463T421 488Z" fill="#6f8b79" opacity=".7" />
      </g>
      <g opacity={mountain * .7} transform={`translate(${-shift * 2} ${distance * 11})`}>
        <path d="M-200 423h2000v190H-200Z" fill={`url(#${id}-mist)`} />
        <path d="M-200 610h2000v170H-200Z" fill={`url(#${id}-mist)`} opacity=".6" />
      </g>
    </svg>
    <div className="travel-scenery__reading-light" />
  </div>
}
