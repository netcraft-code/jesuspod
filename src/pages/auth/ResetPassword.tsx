import { useState, useEffect } from "react";
import { FaLock, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { resetPassword, verifyResetCode } from "../../services/authService";
import colors from "../../theme/colors";
import { useNavigate, useSearchParams } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { useTranslation } from "../../context/LanguageContext";

export default function ResetPassword() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const oobCode = searchParams.get("oobCode");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"verifying" | "valid" | "invalid" | "success" | "error">("verifying");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    usePageTitle(t("auth.resetPasswordTitle"));

    useEffect(() => {
        if (!oobCode) {
            setStatus("invalid");
            setMessage(t("auth.invalidResetCode"));
            return;
        }

        const verifyCode = async () => {
            try {
                await verifyResetCode(oobCode);
                setStatus("valid");
            } catch (err: any) {
                setStatus("invalid");
                setMessage(t("auth.resetLinkExpired"));
            }
        };

        verifyCode();
    }, [oobCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert(t("auth.passwordsDoNotMatchError"));
            return;
        }

        if (newPassword.length < 6) {
            alert(t("auth.passwordLengthError"));
            return;
        }

        try {
            if (oobCode) {
                await resetPassword(oobCode, newPassword);
                setStatus("success");
                setMessage(t("auth.passwordResetSuccessDesc"));
            }
        } catch (err: any) {
            setStatus("error");
            setMessage(t("auth.failedToResetPassword") + err.message);
        }
    };

    return (
        <div className="center-page" style={{ background: colors.mainBg }}>
            <div className="card" style={{ width: "100%", maxWidth: 420 }}>
                <h2 style={{ textAlign: "center", marginBottom: 20 }}>
                    {status === "success" ? t("auth.success") : t("auth.resetPasswordTitle")}
                </h2>

                {status === "verifying" && (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        <div className="spinner" style={{ marginBottom: 10 }}></div>
                        {t("auth.verifyingResetLink")}
                    </div>
                )}

                {status === "invalid" && (
                    <div style={{ textAlign: "center", color: colors.red, padding: "20px 0" }}>
                        <FaExclamationTriangle size={50} style={{ marginBottom: 16, opacity: 0.8 }} />
                        <h3 style={{ marginBottom: 8 }}>{t("auth.linkExpiredTitle")}</h3>
                        <p style={{ color: "#666", fontSize: 14, lineHeight: "1.5" }}>
                            {message || t("auth.linkExpiredDesc")}
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div style={{ textAlign: "center", color: "#28a745", padding: "20px 0" }}>
                        <FaCheckCircle size={60} style={{ marginBottom: 16 }} />
                        <p style={{ color: "#333", fontWeight: 500, fontSize: 16, lineHeight: "1.5", marginBottom: 24 }}>
                            {message}
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate("/login")}
                            style={{ background: "#28a745", width: "100%" }}
                        >
                            {t("auth.goToLoginButton")}
                        </button>
                    </div>
                )}

                {(status === "valid" || status === "error") && (
                    <>
                        {status === "error" && (
                            <div style={{
                                color: colors.red,
                                marginBottom: 16,
                                textAlign: "center",
                                padding: 10,
                                background: "rgba(255,0,0,0.05)",
                                borderRadius: 8,
                                fontSize: 14
                            }}>
                                {message}
                            </div>
                        )}
                        <p style={{ textAlign: "center", color: "#666", fontSize: 14, marginBottom: 20 }}>
                            {t("auth.enterNewPasswordDesc")}
                        </p>
                        <form
                            onSubmit={handleSubmit}
                            style={{ display: "flex", flexDirection: "column", gap: 16 }}
                        >
                            <div style={{ position: "relative" }}>
                                <FaLock className="icon-left" />
                                <input
                                    type="password"
                                    placeholder={t("auth.newPasswordPlaceholder")}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input input-with-icon"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div style={{ position: "relative" }}>
                                <FaLock className="icon-left" />
                                <input
                                    type="password"
                                    placeholder={t("auth.confirmPasswordPlaceholder")}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input input-with-icon"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                className="btn-primary"
                                type="submit"
                                style={{ background: colors.red, marginTop: 8 }}
                            >
                                {t("auth.updatePasswordButton")}
                            </button>
                        </form>
                    </>
                )}

                {status !== "success" && (
                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            marginTop: 24,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "transparent",
                            border: "none",
                            color: colors.red,
                            cursor: "pointer",
                            fontSize: 14,
                            justifyContent: "center",
                            width: "100%",
                            fontWeight: 500
                        }}
                    >
                        <FaArrowLeft size={14} />
                        {t("auth.backToLogin")}
                    </button>
                )}
            </div>
        </div>
    );
}
