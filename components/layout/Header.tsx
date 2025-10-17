export default function Header() {
    return (
        <header className="mb-1">
            <div className="flex flex-wrap gap-2 p-1 rounded-md bg-secondary text-sm">
                <svg width="32" height="32" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{stopColor:'#3b82f6', stopOpacity:1}} />
                            <stop offset="50%" style={{stopColor:'#2563eb', stopOpacity:1}} />
                            <stop offset="100%" style={{stopColor:'#1d4ed8', stopOpacity:1}} />
                        </linearGradient>
                    </defs>
                    <rect x="20" y="20" width="360" height="360" rx="40" fill="white"/>
                    <g transform="translate(200, 180)">
                        <path d="M -100 0 Q -75 -40, -50 -40 Q -25 -40, 0 -15 Q 25 10, 50 10 Q 75 10, 100 -15" 
                            stroke="url(#waveGradient)" 
                            strokeWidth="14" 
                            fill="none" 
                            strokeLinecap="round"
                            strokeLinejoin="round"/>
                        <path d="M -100 25 Q -75 -10, -50 -10 Q -25 -10, 0 10 Q 25 30, 50 30 Q 75 30, 100 10" 
                            stroke="url(#waveGradient)" 
                            strokeWidth="12" 
                            fill="none" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.7"/>
                        <path d="M -100 45 Q -75 10, -50 10 Q -25 10, 0 30 Q 25 50, 50 50 Q 75 50, 100 30" 
                            stroke="url(#waveGradient)" 
                            strokeWidth="10" 
                            fill="none" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.5"/>
                        <circle cx="-50" cy="70" r="16" fill="#2563eb"/>
                    </g>
                </svg>
                <h1 className="text-2xl font-bold text-foreground">Stride</h1>
            </div>
        </header>
    );
}