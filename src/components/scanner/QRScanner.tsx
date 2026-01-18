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

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const onScanRef = useRef(onScan);
    const mountedRef = useRef(false);

    // Keep onScanRef updated so we don't need to restart scanner when onScan prop changes
    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    // 1. Initialize Instance & Cameras (Once)
    useEffect(() => {
        mountedRef.current = true;
        const elementId = "reader";

        // Init Scanner Instance
        let instance: Html5Qrcode | null = null;
        try {
            if (document.getElementById(elementId)) {
                instance = new Html5Qrcode(elementId);
                scannerRef.current = instance;
            }
        } catch (e) {
            console.error("Init error", e);
        }

        // Init Cameras
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
        });

        return () => {
            mountedRef.current = false;
            // Cleanup on unmount
            if (instance) {
                try {
                    // Attempt to stop only if internal state suggests it is running.
                    // Even then, wrap in catch because the library can be quirky.
                    if (instance.isScanning) {
                        instance.stop()
                            .catch((err) => console.warn("Stop failed during cleanup", err))
                            .then(() => {
                                // Always try to clear after stop, even if stop "fails" safely
                                try {
                                    instance?.clear();
                                } catch (e) { /* ignore sync clear error */ }
                            });
                    } else {
                        try {
                            instance.clear();
                        } catch (e) { /* ignore sync clear error */ }
                    }
                } catch (e) {
                    console.warn("Sync cleanup error", e);
                }
                scannerRef.current = null;
            }
        };
    }, []);

    // 2. Manage Scanning State (Stop/Start when camera changes)
    useEffect(() => {
        const html5QrCode = scannerRef.current;
        if (!html5QrCode) return;

        let ignore = false;

        const restart = async () => {
            try {
                if (html5QrCode.isScanning) {
                    await html5QrCode.stop().catch(() => { });
                }

                if (ignore) return;

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
                        // Use ref to always call latest callback without restarting
                        if (onScanRef.current) onScanRef.current(decodedText);
                    },
                    (errorMessage) => {
                        // ignore
                    }
                );

                if (mountedRef.current && !ignore) setError(null);
            } catch (err: any) {
                if (mountedRef.current && !ignore) {
                    // Only show meaningful errors
                    if (err?.name === "NotAllowedError") {
                        setError("Camera permission denied");
                    } else if (err?.toString().includes("already")) {
                        // ignore "already started" errors
                    } else {
                        setError("Camera Error: " + (err.message || err));
                    }
                }
            }
        };

        restart();

        return () => {
            ignore = true;
        };

    }, [cameraIndex, cameras]); // Removed onScan from deps!

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
