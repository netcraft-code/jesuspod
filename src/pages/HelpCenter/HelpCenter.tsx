import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./HelpCenter.css";
import { useSelector } from "react-redux";
import emailjs from '@emailjs/browser';
import { useTranslation } from "../../context/LanguageContext";


export default function HelpCenter() {
    const { t } = useTranslation();
    const [active, setActive] = useState("Help Center");
    const [profileOpen, setProfileOpen] = useState(false);

    // Get user from Redux store using the correct state path
    const user = useSelector((state: any) => state.auth.user);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    // Pre-fill user data when available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.displayName || user.email?.split('@')[0] || "",
                email: user.email || ""
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.message.trim()) return;

        setStatus('sending');

        try {
            // Credentials from archive
            const serviceID = "service_t44y7q2";
            const templateID = "template_uumgdnm";
            const publicKey = "25NANkaCQPkvwUsR0";

            const templateParams = {
                name: formData.name,
                email: formData.email,
                message: formData.message,
            };

            await emailjs.send(serviceID, templateID, templateParams, publicKey);

            setStatus('success');
            setFormData(prev => ({ ...prev, message: "" })); // Clear message only

            // Reset success message after 3 seconds
            setTimeout(() => setStatus('idle'), 3000);

        } catch (error) {
            console.error("Failed to send email:", error);
            setStatus('error');
        }
    };

    return (
        <div className="help-center-container">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <main className="help-content">
                <style>
                    {/* Inline style to ensure header override if CSS fails to load properly first */}
                    {`
                    .help-center-container { padding-top: 0; } 
                    `}
                </style>
                <div className="help-header">
                    <h1>{t("helpCenter.title")}</h1>
                </div>

                <form className="help-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">{t("helpCenter.nameLabel")}</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="help-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t("helpCenter.namePlaceholder")}
                            disabled={!!user?.displayName || !!user?.email} // Disable if user logged in
                            readOnly={!!user?.displayName || !!user?.email}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">{t("helpCenter.emailLabel")}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="help-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t("helpCenter.emailPlaceholder")}
                            disabled={!!user?.email}
                            readOnly={!!user?.email}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">{t("helpCenter.messageLabel")}</label>
                        <textarea
                            id="message"
                            name="message"
                            className="help-textarea"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder={t("helpCenter.messagePlaceholder")}
                            disabled={status === 'sending'}
                        />
                    </div>

                    <button
                        type="submit"
                        className="help-submit-button"
                        disabled={status === 'sending' || !formData.message.trim()}
                    >
                        {status === 'sending' ? t("helpCenter.sending") : t("helpCenter.submitRequest")}
                    </button>

                    {status === 'success' && <p className="success-message">{t("helpCenter.successMessage")}</p>}
                    {status === 'error' && <p className="error-message">{t("helpCenter.errorMessage")}</p>}
                </form>
            </main>

            <Footer />
        </div>
    );
}
