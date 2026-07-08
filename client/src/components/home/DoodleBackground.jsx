// Self-drawing doodles: stroke paths (24x24 viewBox) that trace themselves in
// via the stroke-dasharray/dashoffset technique. Every primitive carries
// pathLength="1" so the same normalized animation works for any geometry;
// multi-subpath paths draw their subpaths in sequence, like real sketching.
const SHAPES = {
  star: ['M12 2.5l2.7 6 6.6.7-5 4.4 1.5 6.6-5.8-3.5-5.9 3.4 1.6-6.5-4.9-4.5 6.6-.6z'],
  heart: [
    'M12 20c-4.7-4.3-8.4-7.6-8.3-11.3.1-2.5 2.1-4.4 4.4-4.3 1.6 0 3 1 3.9 2.5.9-1.5 2.3-2.5 3.9-2.5 2.3 0 4.3 1.8 4.4 4.3.1 3.7-3.6 7-8.3 11.3z',
  ],
  sun: [
    'M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6z',
    'M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7',
  ],
  cloud: ['M6.5 18h9.8a4.1 4.1 0 0 0 .7-8.1A5.6 5.6 0 0 0 6.3 8.8 4.4 4.4 0 0 0 6.5 18z'],
  lightning: ['M13 2 5 13.5h5.5L9 22l8.5-11.5H12z'],
  smiley: [
    'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
    'M8.6 9.6v.7M15.4 9.6v.7',
    'M8 14c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4',
  ],
  house: ['M4 11l8-7 8 7', 'M6 9.5V20h12V9.5', 'M10 20v-5.5h4V20'],
  tree: [
    'M12 15.5c-3.4 0-6-2.2-6-5 0-1.9 1.2-3.5 3-4.3.3-2 1.5-3.2 3-3.2s2.7 1.2 3 3.2c1.8.8 3 2.4 3 4.3 0 2.8-2.6 5-6 5z',
    'M12 21v-5.5',
  ],
  flower: [
    'M12 5.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8z',
    'M12 1.9a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM15.7 5.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM12 9.3a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM8.3 5.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8z',
    'M12 13v8',
    'M12 17.5c-1.9 0-3.4-1-3.9-2.4 1.9-.5 3.4.5 3.9 2.4z',
  ],
  arrow: ['M4 18C7 10.5 13 6.3 19.5 5.6', 'M19.5 5.6l-4-.9M19.5 5.6l-2.3 3.4'],
}

// Scattered around the screen edges so the center card stays readable.
// cycle = full draw->hold->fade loop duration (draw is ~32% of it, i.e. 2-3s);
// delay staggers the starts so shapes never all draw at once.
const DOODLES = [
  { shape: 'star', left: '4%', top: '6%', size: 40, color: '#FFD93D', cycle: 8, delay: 0, rotate: -8 },
  { shape: 'cloud', left: '70%', top: '4%', size: 48, color: '#7C3AED', cycle: 8, delay: 2.4, rotate: 0 },
  { shape: 'sun', left: '88%', top: '8%', size: 52, color: '#FFD93D', cycle: 9, delay: 0.6, rotate: 0 },
  { shape: 'star', left: '40%', top: '5%', size: 30, color: '#7C3AED', cycle: 7, delay: 4.6, rotate: 12 },
  { shape: 'smiley', left: '5%', top: '40%', size: 44, color: '#10B981', cycle: 9.5, delay: 1.8, rotate: -6 },
  { shape: 'lightning', left: '93%', top: '42%', size: 36, color: '#FFD93D', cycle: 7, delay: 3, rotate: 8 },
  { shape: 'tree', left: '3%', top: '64%', size: 46, color: '#10B981', cycle: 8.5, delay: 3.6, rotate: 0 },
  { shape: 'heart', left: '11%', top: '84%', size: 44, color: '#FF6B6B', cycle: 8.5, delay: 1.2, rotate: 6 },
  { shape: 'flower', left: '28%', top: '88%', size: 42, color: '#7C3AED', cycle: 8, delay: 2, rotate: -5 },
  { shape: 'arrow', left: '58%', top: '90%', size: 46, color: '#10B981', cycle: 7.5, delay: 5, rotate: -10 },
  { shape: 'heart', left: '78%', top: '87%', size: 34, color: '#FFD93D', cycle: 7.5, delay: 5.6, rotate: -8 },
  { shape: 'house', left: '90%', top: '72%', size: 48, color: '#FF6B6B', cycle: 9, delay: 4.2, rotate: 4 },
]

function DoodleBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {DOODLES.map((doodle, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute"
          style={{
            left: doodle.left,
            top: doodle.top,
            width: doodle.size,
            height: doodle.size,
            color: doodle.color,
            opacity: 0.4,
            transform: `rotate(${doodle.rotate}deg)`,
          }}
        >
          {SHAPES[doodle.shape].map((d, pathIndex) => (
            <path
              key={pathIndex}
              d={d}
              pathLength="1"
              className="doodle-path"
              style={{ '--cycle': `${doodle.cycle}s`, '--delay': `${doodle.delay}s` }}
            />
          ))}
        </svg>
      ))}
    </div>
  )
}

export default DoodleBackground
