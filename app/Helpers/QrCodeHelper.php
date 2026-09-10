<?php

namespace App\Helpers;

use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrCodeHelper
{
    /**
     * Generate inline Base64 SVG data URI for QR Code.
     */
    public static function generateBase64Svg(string $text, int $size = 100): string
    {
        try {
            $svg = QrCode::format('svg')
                ->size($size)
                ->color(30, 58, 138) // #1e3a8a navy color
                ->backgroundColor(255, 255, 255)
                ->margin(1)
                ->generate($text);

            return 'data:image/svg+xml;base64,' . base64_encode($svg);
        } catch (\Throwable $e) {
            // Fallback SVG if generator error
            $fallbackSvg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="{$size}" height="{$size}" viewBox="0 0 {$size} {$size}">
    <rect width="100%" height="100%" fill="#ffffff" stroke="#1e3a8a" stroke-width="2"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="9" fill="#1e3a8a">VERIFIED</text>
</svg>
SVG;
            return 'data:image/svg+xml;base64,' . base64_encode($fallbackSvg);
        }
    }
}
