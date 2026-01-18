
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
    onScan: (decodedText: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
    const [cameraIndex, setCameraIndex] = useState<number>(0);

    // We used a ref to track the potential scanner instance to avoid React state race conditions
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountedRef = useRef(false);

    // Initialize cameras once
    useEffect(() => {
        mountedRef.current = true;
        Html5Qrcode.getCameras().then(devices => {
            if (mountedRef.current && devices && devices.length) {
                setCameras(devices);
                const backCameraIndex = devices.findIndex(device =>
                    device.label.toLowerCase().includes("back") ||
                    device.label.toLowerCase().includes("environment")
                );
                setCameraIndex(backCameraIndex !== -1 ? backCameraIndex : 0);
            }
        }).catch(err => {
            console.error("Error enumerating cameras", err);
            // Don't set error here to avoid blocking UI, just fallback
        });

        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Handle scanner lifecycle in a single effect dependent on cameraIndex
    useEffect(() => {
        // Wait for cameras to load if we expect them? 
        // Actually we can start with default even if cameras list is empty (fallback mode)

        const elementId = "reader";
        if (!document.getElementById(elementId)) {
            console.error("Reader element not found");
            return;
        }

        let html5QrCode: Html5Qrcode;
        try {
            html5QrCode = new Html5Qrcode(elementId);
            scannerRef.current = html5QrCode;
        } catch (e: any) {
            console.error("Failed to create Html5Qrcode instance", e);
            setError("Initialization Failed: " + e.message);
            return;
        }

        const startScanner = async () => {
            try {
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                let videoConfig: any = { facingMode: "environment" };

                if (cameras.length > 1) {
                    videoConfig = { deviceId: { exact: cameras[cameraIndex].id } };
                } else if (cameraIndex % 2 !== 0) {
                    videoConfig = { facingMode: "user" };
                }

                await html5QrCode.start(
                    videoConfig,
                    config,
                    (decodedText) => {
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // ignore
                    }
                );

                if (mountedRef.current) {
                    setError(null);
                }
            } catch (err: any) {
                if (mountedRef.current) {
                    console.error("Error starting scanner", err);
                    // Only show error if we really failed and it's not just a cleanup race
                    setError("Camera Error: " + (err.message || err));
                }
            }
        };

        startScanner();

        return () => {
            // Cleanup: stop and clear
            if (html5QrCode) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(err => {
                    // If stop failed (e.g. not running), try to clear anyway
                    try {
                        html5QrCode.clear();
                    } catch (e) {
                        console.error("Failed to clear", e);
                    }
                });
            }
        };
    }, [cameraIndex, cameras, onScan]); // Re-run entirely when index changes. robust but heavy.

    const switchCamera = () => {
        if (cameras.length > 1) {
            setCameraIndex((prev) => (prev + 1) % cameras.length);
        } else {
            setCameraIndex((prev) => prev + 1);
        }
    };

    return (
        <div className="w-full h-full relative group">
            <div id="reader" className="w-full h-full overflow-hidden rounded-lg bg-black"></div>

            {error && <p className="absolute top-2 left-2 right-2 text-center bg-black/50 text-red-400 text-xs p-1 rounded backdrop-blur-sm z-20">{error}</p>}

            <button
                onClick={switchCamera}
                type="button"
                className="absolute bottom-4 right-4 z-20 p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white shadow-lg active:scale-95 transition-all hover:bg-white/30"
                title="Switch Camera"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </button>

            <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-black/40 backdrop-blur-sm rounded text-[10px] text-white/70 pointer-events-none">
                {cameras.length <= 1 ? "Mode: " : "Cam: "}
                {cameras.length > 0 ? (cameras[cameraIndex]?.label?.substring(0, 15) || "Unk") : (cameraIndex % 2 === 0 ? "Back" : "Front")}
            </div>
        </div>
    );
}
