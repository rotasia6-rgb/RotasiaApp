'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import styles from './form.module.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' });

// Configuration
const FORM_SUPABASE_URL = process.env.NEXT_PUBLIC_ROTASIA_FORM_URL || 'https://cokrhsjbkkhrrimrzmgy.supabase.co';
const FORM_SUPABASE_KEY = process.env.NEXT_PUBLIC_ROTASIA_FORM_KEY || 'sb_publishable_w5KN2D0Zy1-g3AeoDP6icQ_zfekGSLS';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyImFNGdjEl9s08PAczr4LFRQVHAUXPn9F8N0AkB1gbCdp9sAg7oyOvSQAh_vwdTgJa/exec';

// Initialize Supabase for this specific form
const supabase = createClient(FORM_SUPABASE_URL, FORM_SUPABASE_KEY);

export default function MrMsRotasiaPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName(null);
        }
    };

    const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]); // Remove data:image/...;base64,
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage(null);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        try {
            let photoUrl = '';

            // 1. Upload to Google Drive via Apps Script
            if (file) {
                const base64File = await getBase64(file);

                const payload = {
                    file: base64File,
                    filename: `${Date.now()}_${file.name}`,
                    mimeType: file.type
                };

                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8",
                    },
                });

                const result = await response.json();

                if (result.status === 'success') {
                    photoUrl = result.fileUrl;
                    console.log('File uploaded to Drive:', photoUrl);
                } else {
                    throw new Error('Google Drive upload failed: ' + result.message);
                }
            }

            // 2. Submit Data to Supabase
            const { data, error } = await supabase
                .from('registrations')
                .insert([
                    {
                        full_name: formData.get('fullName'),
                        gender: formData.get('gender'),
                        dob: formData.get('dob'),
                        club_name: formData.get('clubName'),
                        district: formData.get('district'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        instagram: formData.get('instagram'),
                        photo_url: photoUrl,
                        bio: formData.get('bio')
                    }
                ]);

            if (error) throw error;

            console.log('Supabase Insert Success:', data);
            setSuccessMessage('Registration Successful! Thank you for registering for Mr. & Ms. Rotasia.');

            form.reset();
            setFileName(null);

            // Remove message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);

        } catch (error: any) {
            console.error('Error submitting form:', error);
            alert('An error occurred during registration. Please try again. \nDebug: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${styles.container} ${inter.variable} ${plusJakarta.variable}`} style={{ fontFamily: 'var(--font-body)' }}>
            <div className={styles.backgroundOverlay}></div>

            <header className={styles.siteHeader}>
                <img
                    src="https://rotasia2026chennai.com/wp-content/uploads/2024/07/logo-text-1.png"
                    alt="Rotasia Chennai 2026 Logo"
                    className={styles.logo}
                />
            </header>

            <main className={styles.mainContainer}>
                <div className={styles.formCard}>
                    <h1 className={styles.formTitle}>Mr. & Ms. Rotasia</h1>
                    <p className={styles.formSubtitle}>Register to be the face of Rotasia Chennai 2026</p>

                    <form id="rotasiaForm" onSubmit={handleSubmit} encType="multipart/form-data">

                        <div className={styles.formGroup}>
                            <label htmlFor="fullName" className={styles.label}>Full Name</label>
                            <input type="text" id="fullName" name="fullName" placeholder="Enter your full name" required className={styles.input} />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="gender" className={styles.label}>Gender</label>
                                <select id="gender" name="gender" required className={styles.select} defaultValue="">
                                    <option value="" disabled>Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="dob" className={styles.label}>Date of Birth</label>
                                <input type="date" id="dob" name="dob" required className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="clubName" className={styles.label}>Rotaract Club Name</label>
                            <input type="text" id="clubName" name="clubName" placeholder="e.g. RAC xxx" required className={styles.input} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="district" className={styles.label}>Rotary International District</label>
                            <input type="text" id="district" name="district" placeholder="e.g. District xxx" required className={styles.input} />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>Email Address</label>
                                <input type="email" id="email" name="email" placeholder="yourname@example.com" required className={styles.input} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone" className={styles.label}>WhatsApp Number</label>
                                <input type="tel" id="phone" name="phone" placeholder="+91 98765 43210" required className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="instagram" className={styles.label}>Instagram Handle</label>
                            <div className={styles.inputIconWrapper}>
                                <span className={styles.inputIcon}>@</span>
                                <input type="text" id="instagram" name="instagram" placeholder="finstein_emp" className={`${styles.input} ${styles.hasIcon}`} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="photo" className={styles.label}>Upload Your Photo (Portfolio Shot)</label>
                            <div className={styles.fileUploadWrapper}>
                                <input
                                    type="file"
                                    id="photo"
                                    name="photo"
                                    accept="image/*"
                                    required
                                    className={styles.fileInput}
                                    onChange={handleFileChange}
                                />
                                <div className={`${styles.fileUploadVisual} ${fileName ? styles.fileUploadVisualActive : ''}`}>
                                    <span className={styles.uploadIcon}>📁</span>
                                    <span className={styles.uploadText}>{fileName ? `Selected: ${fileName}` : 'Click to upload or drag & drop'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="bio" className={styles.label}>Why do you want to participate?</label>
                            <textarea id="bio" name="bio" rows={4}
                                placeholder="Tell us about yourself in a few words..." className={styles.textarea}></textarea>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isLoading} style={isLoading ? { opacity: 0.7 } : {}}>
                            {isLoading ? 'Processing...' : 'Register Now'}
                        </button>

                        {successMessage && (
                            <div style={{
                                background: 'rgba(76, 36, 193, 0.9)',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '12px',
                                marginTop: '1rem',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                animation: 'fadeIn 0.5s'
                            }}>
                                {successMessage}
                            </div>
                        )}

                    </form>
                </div>
            </main>

            <footer className={styles.siteFooter}>
                <p>© 2026 Rotasia Chennai. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
