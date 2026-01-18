
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
    onScan: (decodedText: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Prevent multiple initializations if strictly strict mode is on, though cleanup should handle it
        if (scannerRef.current) return;

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        // Explicitly find the back camera
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                // Try to find a camera with "back" or "environment" in the label
                const backCamera = devices.find(device =>
                    device.label.toLowerCase().includes("back") ||
                    device.label.toLowerCase().includes("environment")
                );

                // Use back camera ID if found, otherwise use the last camera (often back on mobile), or fallback to facingMode constraint
                const cameraIdOrConfig = backCamera ? { deviceId: { exact: backCamera.id } } : { facingMode: "environment" };

                html5QrCode.start(
                    cameraIdOrConfig,
                    config,
                    (decodedText) => {
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // ignore errors
                    }
                ).catch((err) => {
                    console.error("Error starting scanner", err);
                    setError("Camera error: " + (err.message || err));
                });
            } else {
                setError("No cameras found.");
            }
        }).catch(err => {
            console.error("Error getting cameras", err);
            setError("Error finding camera: " + (err.message || err));
        });

        return () => {
            if (scannerRef.current) {
                // We use the instance valid at setup time
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(console.error);
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
