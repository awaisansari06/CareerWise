export default function CareerPathBackground() {
  return (
    <div className="career-path-background" aria-hidden="true">
      <div className="career-path-dots" />
      <div className="career-path-grain" />
      <svg className="career-path-lines career-path-desktop" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
        <g className="career-path-contours">
          <path d="M-80 230C110 200 130 400 300 445S560 460 610 700" />
          <path d="M-80 255C90 225 110 425 280 470S540 485 590 725" />
          <path d="M-80 280C70 250 90 450 260 495S520 510 570 750" />
          <path d="M1520 70C1270 75 1390 300 1170 360S1080 600 870 720" />
          <path d="M1520 95C1290 100 1410 325 1190 385S1100 625 890 745" />
          <path d="M1520 120C1310 125 1430 350 1210 410S1120 650 910 770" />
        </g>
        <g className="career-path-route">
          <path d="M-50 615C180 540 200 675 400 605S780 680 1040 460 1290 245 1490 290" />
          <path className="career-path-dashed" d="M-50 705C210 625 250 765 455 685S815 740 1090 555 1300 385 1490 420" />
          <circle cx="155" cy="596" r="5" /><circle cx="1040" cy="460" r="5" /><circle cx="1318" cy="279" r="4" />
        </g>
      </svg>
      <svg className="career-path-lines career-path-mobile" viewBox="0 0 400 800" preserveAspectRatio="none" fill="none">
        <g className="career-path-contours">
          <path d="M-60 90C135 60 15 240 75 320S20 440-50 510" />
          <path d="M-60 108C153 78 33 258 93 338S38 458-32 528" />
          <path d="M-60 126C171 96 51 276 111 356S56 476-14 546" />
          <path d="M450 115C255 165 415 290 340 380S365 590 455 640" />
          <path d="M450 133C273 183 433 308 358 398S383 608 473 658" />
        </g>
        <g className="career-path-route">
          <path d="M-45 690C70 550 185 720 290 600S350 465 445 475" />
          <path className="career-path-dashed" d="M-40 745C95 625 185 775 315 660S385 540 450 550" />
          <circle cx="45" cy="628" r="4" /><circle cx="348" cy="516" r="4" />
        </g>
      </svg>
    </div>
  );
}
