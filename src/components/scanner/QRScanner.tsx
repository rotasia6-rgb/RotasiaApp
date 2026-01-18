
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
    onScan: (decodedText: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
    const [cameraIndex, setCameraIndex] = useState<number>(0);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        // Prevent multiple initializations
        if (scannerRef.current) return;

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                setCameras(devices);
                // Try to find back camera to start with
                const backCameraIndex = devices.findIndex(device =>
                    device.label.toLowerCase().includes("back") ||
                    device.label.toLowerCase().includes("environment")
                );
                setCameraIndex(backCameraIndex !== -1 ? backCameraIndex : 0);
            } else {
                setError("No cameras found.");
            }
        }).catch(err => {
            console.error("Error getting cameras", err);
            setError("Error finding camera: " + (err.message || err));
        });

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(err => console.error("Cleanup error", err));
                scannerRef.current = null;
            }
        };
    }, []);

    // Effect to start/restart scanner when cameraIndex or cameras change
    useEffect(() => {
        if (!cameras.length || !scannerRef.current) return;

        const startScanner = async () => {
            const html5QrCode = scannerRef.current;
            if (!html5QrCode) return;

            try {
                if (html5QrCode.isScanning) {
                    await html5QrCode.stop();
                }

                const cameraId = cameras[cameraIndex].id;
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };

                await html5QrCode.start(
                    { deviceId: { exact: cameraId } },
                    config,
                    (decodedText) => {
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // ignore
                    }
                );
                setIsScanning(true);
                setError(null);
            } catch (err: any) {
                console.error("Error starting scanner", err);
                setError("Camera error: " + (err.message || err));
                setIsScanning(false);
            }
        };

        startScanner();

    }, [cameraIndex, cameras, onScan]);

    const switchCamera = () => {
        if (cameras.length > 1) {
            setCameraIndex((prev) => (prev + 1) % cameras.length);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {cameras.length > 1 && (
                <button
                    onClick={switchCamera}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Switch Camera
                </button>
            )}

            <p className="text-xs text-center mt-2 text-gray-500">
                Camera: {cameras[cameraIndex]?.label || "Loading..."}
            </p>
        </div>
    );
}
