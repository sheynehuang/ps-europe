// Hand-drawn-style SVG postcard: Eiffel Tower, Alps + train, Colosseum, Sagrada Família, balloon.
export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 360 210" role="img" aria-label="Illustrated Europe: Paris, the Alps, Rome and Barcelona">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FCEBD8" /><stop offset="1" stopColor="#FDF6EC" /></linearGradient>
        <pattern id="arch" width="9" height="11" patternUnits="userSpaceOnUse"><rect width="9" height="11" fill="#E2A668" /><path d="M1.5 11V5.5a3 3 0 0 1 6 0V11Z" fill="#9A5B33" /></pattern>
        <pattern id="arch2" width="7" height="9" patternUnits="userSpaceOnUse"><rect width="7" height="9" fill="#EDB97C" /><path d="M1.2 9V4.5a2.3 2.3 0 0 1 4.6 0V9Z" fill="#B06C3D" /></pattern>
        <clipPath id="balloon"><circle cx="318" cy="36" r="17" /></clipPath>
      </defs>
      <rect width="360" height="210" fill="url(#sky)" />
      <circle cx="84" cy="44" r="19" fill="#F3B562" />

      <g className="drift" fill="#fff" opacity=".95">
        <ellipse cx="40" cy="30" rx="22" ry="8" /><ellipse cx="54" cy="25" rx="13" ry="9" />
        <ellipse cx="250" cy="52" rx="24" ry="8" /><ellipse cx="262" cy="46" rx="12" ry="8" />
      </g>

      <path d="M210 26 C230 40 250 10 268 30" fill="none" stroke="#9A5B33" strokeWidth="1.2" strokeDasharray="3 4" opacity=".6" />
      <path className="plane" d="M196 22 l16 4 -16 6 3 -5Z" fill="#fff" stroke="#9A5B33" strokeWidth="1" />

      {/* Alps */}
      <path d="M118 140 L182 46 L246 140Z" fill="#9DB4CC" />
      <path d="M182 46 L197 68 L189 64 L182 73 L174 63 L166 69Z" fill="#fff" />
      <path d="M176 140 L228 74 L290 140Z" fill="#B9CCDE" />
      <path d="M228 74 L240 90 L232 87 L226 93 L219 86Z" fill="#fff" />
      <g fill="#4F8A5B">{[150, 160, 236, 248, 258].map((x) => <path key={x} d={`M${x} 140 l6 -16 6 16Z`} />)}</g>

      {/* Hills */}
      <path d="M0 150 Q60 118 130 142 T260 136 T360 140 V210 H0Z" fill="#B5DBA8" />
      <path d="M0 168 Q90 146 180 164 T360 160 V210 H0Z" fill="#8CC497" />

      {/* Viaduct + train */}
      <rect x="140" y="128" width="130" height="5" rx="2" fill="#C9B79E" />
      <path d="M140 133 h130 v12 h-130Z M146 145 a8 8 0 0 1 16 0 M168 145 a8 8 0 0 1 16 0 M190 145 a8 8 0 0 1 16 0 M212 145 a8 8 0 0 1 16 0 M234 145 a8 8 0 0 1 16 0" fill="#D8C8B0" stroke="#B39C80" strokeWidth="1" />
      <g className="train">
        <rect x="172" y="117" width="60" height="11" rx="4" fill="#D9534F" />
        <path d="M232 117 h6 a5 5 0 0 1 5 5 v6 h-11Z" fill="#C2413D" />
        <g fill="#FDF0DE">{[176, 186, 196, 206, 216, 226].map((x) => <rect key={x} x={x} y="119.5" width="6" height="4" rx="1" />)}</g>
      </g>

      {/* Eiffel Tower */}
      <g fill="#B9774A">
        <path d="M30 172 Q44 120 47 34 h4 Q54 120 68 172 h-9 Q52 140 49 140 Q46 140 39 172Z" />
        <rect x="38" y="110" width="22" height="4" rx="1" /><rect x="43" y="74" width="12" height="3" rx="1" />
        <rect x="48.3" y="22" width="1.4" height="12" />
      </g>
      {/* Pink blossom + Parisian building */}
      <rect x="0" y="132" width="26" height="44" fill="#F7E3C9" /><path d="M-2 132 h30 l-4 -8 h-22Z" fill="#7C95B3" />
      <g fill="#7C95B3">{[4, 14].map((x) => [140, 152, 164].map((y) => <rect key={x + '-' + y} x={x} y={y} width="6" height="7" rx="1" />))}</g>
      <g fill="#F2A7BC"><circle cx="16" cy="178" r="12" /><circle cx="30" cy="186" r="10" /><circle cx="6" cy="192" r="11" /></g>

      {/* Colosseum */}
      <path d="M118 196 V160 Q170 146 222 160 V196Z" fill="url(#arch)" stroke="#9A5B33" strokeWidth="1.2" />
      <path d="M118 160 Q170 146 222 160 V166 Q170 153 118 166Z" fill="#D9955A" />
      <path d="M200 156 Q214 158 222 162 V196 H206Z" fill="#E9C9A5" opacity=".5" />

      {/* Sagrada Família */}
      <g>
        <path d="M270 190 V120 h70 V190Z" fill="url(#arch2)" />
        {[[278, 78], [292, 62], [306, 56], [320, 66], [334, 84]].map(([x, top]) => (
          <g key={x}><path d={`M${x - 5} 122 L${x} ${top} L${x + 5} 122Z`} fill="#D99A5E" /><circle cx={x} cy={top + 2} r="2.4" fill="#F3B562" /></g>
        ))}
        <path d="M296 190 v-26 a9 9 0 0 1 18 0 v26Z" fill="#8A4F2B" />
      </g>

      {/* Sea */}
      <path d="M0 200 Q30 194 60 200 T120 200 T180 200 T240 200 T300 200 T360 200 V210 H0Z" fill="#9CCAE3" />

      {/* Balloon */}
      <g className="balloon">
        <g clipPath="url(#balloon)">
          {['#F28C6B', '#F6C177', '#9BD3A6', '#8EC5E8', '#F2A7BC', '#F28C6B'].map((c, i) => <rect key={i} x={301 + i * 6} y="18" width="6" height="36" fill={c} />)}
        </g>
        <path d="M309 50 L314 60 M327 50 L322 60" stroke="#9A5B33" strokeWidth="1" />
        <rect x="313" y="60" width="10" height="7" rx="1.5" fill="#B9774A" />
      </g>
    </svg>
  )
}
