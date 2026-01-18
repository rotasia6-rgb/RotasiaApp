
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
    onScan: (decodedText: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Prevent multiple initializations
        if (scannerRef.current) return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
            },
            (errorMessage) => {
                // ignore errors
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        };
    }, [onScan]);

    return (
        <div className="w-full max-w-sm mx-auto">
            <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
}
