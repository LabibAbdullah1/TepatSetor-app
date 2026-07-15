import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${props.className} text-[#ff4b4b]`}
        >
            {/* Target Center Circle */}
            <circle
                cx="100"
                cy="100"
                r="16"
                fill="currentColor"
                stroke="none"
            />

            {/* Inner Ring (Divided into 4 quadrants) */}
            <path d="M 136 92 A 38 38 0 0 0 108 64" />
            <path d="M 92 64 A 38 38 0 0 0 64 92" />
            <path d="M 64 108 A 38 38 0 0 0 92 136" />
            <path d="M 108 136 A 38 38 0 0 0 136 108" />

            {/* Outer Ring with Pinwheel Extensions */}
            <path d="M 160 92 A 60 60 0 0 0 108 40 L 108 10" />
            <path d="M 92 40 A 60 60 0 0 0 40 92 L 10 92" />
            <path d="M 40 108 A 60 60 0 0 0 92 160 L 92 190" />
            <path d="M 108 160 A 60 60 0 0 0 160 108 L 190 108" />
        </svg>
    );
}
