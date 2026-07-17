import { useState } from "react";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { sendResetEmail } from "../../services/authService";
import colors from "../../theme/colors";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { useTranslation } from "../../context/LanguageContext";

export default function ForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();
    usePageTitle(t("auth.resetPasswordTitle"));

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        try {
            await sendResetEmail(email);
            setSent(true);
        } catch (err:any) {
            alert(t("auth.failedAlert") + err.message);
        }
    };

    return (
        <div className="center-page" style={{ background: colors.mainBg }}>
            <div className="card" style={{ width: "100%", maxWidth: 420 }}>
                <h2 style={{ textAlign: "center" }}>{t("auth.resetPasswordTitle")}</h2>
                {sent && (
                    <div
                        style={{
                            marginTop: 14,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#28a745",
                            fontWeight: 500,
                        }}
                    >
                        {t("auth.resetEmailSent")}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                    <div style={{ position: "relative" }}>
                        <FaEnvelope className="icon-left" />
                        <input
                            placeholder="john@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input input-with-icon"
                        />
                    </div>

                    <button
                        className="btn-primary"
                        type="submit"
                        style={{ background: colors.red }}
                    >
                        {t("auth.sendResetEmailButton")}
                    </button>


                </form>

                {/* ---------- Back To Login Button ---------- */}
                <button
                    onClick={() => navigate("/login")}
                    style={{
                        marginTop: 20,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "transparent",
                        border: "none",
                        color: colors.red,
                        cursor: "pointer",
                        fontSize: 14,
                        justifyContent: "center",
                    }}
                >
                    <FaArrowLeft size={14} />
                    {t("auth.backToLogin")}
                </button>
            </div>
        </div>
    );
}
