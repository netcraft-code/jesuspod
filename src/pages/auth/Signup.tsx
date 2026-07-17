import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser, FaRegEye, FaRegEyeSlash } from "react-icons/fa";

import colors from "../../theme/colors";
import { useDispatch } from "react-redux";
import { authStart, authSuccess, authFailure } from "../../redux/authSlice";
import { signupWithEmail } from "../../services/authService";
import { loginWithGoogle as loginGoogleFn } from "../../services/authService";
import InputField from "../../components/UI/InputField";
import GoogleButton from "../../components/UI/GoogleButton";
import defaultAvatar from "../../assets/default-avatar.svg";
import { updateProfile } from "firebase/auth";
import { uploadUserImage } from "../../services/uploadService";
import usePageTitle from "../../hooks/usePageTitle";
import { useTranslation } from "../../context/LanguageContext";


export default function Signup() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    usePageTitle(t("auth.signupButton"));

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",

    });

    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(defaultAvatar);
    const [profileFile, setProfileFile] = useState(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);


    // Email validation
    const validateEmailFormat = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // live validation
        switch (name) {
            case "username":
                setErrors((prev) => ({
                    ...prev,
                    username: !value.trim() ? t("auth.enterUsernameError") : "",
                }));
                break;
            case "email":
                setErrors((prev) => ({
                    ...prev,
                    email: !value.trim()
                        ? t("auth.enterEmailError")
                        : !validateEmailFormat(value)
                            ? t("auth.invalidEmailError")
                            : "",
                }));
                break;
            case "password":
                setErrors((prev) => ({
                    ...prev,
                    password: !value.trim()
                        ? t("auth.enterPasswordError")
                        : value.length < 6
                            ? t("auth.passwordLengthError")
                            : "",
                    confirmPassword:
                        form.confirmPassword && form.confirmPassword !== value
                            ? t("auth.passwordsDoNotMatchError")
                            : "",
                }));
                break;
            case "confirmPassword":
                setErrors((prev) => ({
                    ...prev,
                    confirmPassword:
                        !value.trim()
                            ? t("auth.confirmPasswordError")
                            : value !== form.password
                                ? t("auth.passwordsDoNotMatchError")
                                : "",
                }));
                break;
            default:
                break;
        }

    };

    const handleProfileClick = () => {
        fileInputRef.current?.click();
    };

    const handleProfileChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));  // Preview
            setProfileFile(file);                        // Actual file for upload
        }
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        // Final validation
        if (!form.username.trim()) return setErrors((prev) => ({ ...prev, username: t("auth.enterUsernameError") }));
        if (!form.email.trim()) return setErrors((prev) => ({ ...prev, email: t("auth.enterEmailError") }));
        if (!validateEmailFormat(form.email)) return setErrors((prev) => ({ ...prev, email: t("auth.invalidEmailError") }));
        if (!form.password.trim()) return setErrors((prev) => ({ ...prev, password: t("auth.enterPasswordError") }));
        if (form.password.length < 6) return setErrors((prev) => ({ ...prev, password: t("auth.passwordLengthError") }));
        if (!form.confirmPassword.trim()) return setErrors((prev) => ({ ...prev, confirmPassword: t("auth.confirmPasswordError") }));
        if (form.password !== form.confirmPassword) return setErrors((prev) => ({ ...prev, confirmPassword: t("auth.passwordsDoNotMatchError") }));

        dispatch(authStart());
        setLoading(true);

        try {
            const res = await signupWithEmail(form.email, form.password);
            const user = res.user;
            const token = await user.getIdToken();
            localStorage.setItem("token", token);
            let finalPhotoURL = "";

            if (profileFile) {
                // Upload to Firebase Storage
                finalPhotoURL = await uploadUserImage(profileFile);
            }

            // Update Firebase Auth Profile
            await updateProfile(user, {
                displayName: form.username,
                photoURL: finalPhotoURL || "",
            });
            dispatch(authSuccess({
                uid: user.uid,
                email: user.email,
                displayName: form.username,
                photoURL: profileImage,
            }));
            navigate("/home");
        } catch (err: any) {
            alert(err.message)

            dispatch(authFailure(err.message));
        }

        setLoading(false);
    };


    const handleGoogle = async () => {
        dispatch(authStart());
        try {
            const res = await loginGoogleFn();
            const user = res.user;
            const token = await user.getIdToken();
            localStorage.setItem("token", token);
            dispatch(authSuccess({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
            }));
            navigate("/home");
        } catch (err: any) {
            alert(err.message)
            dispatch(authFailure(err.message));
        }
    };

    // Disable signup if any error or empty field
    const isFormInvalid: boolean =
        !form.username.trim() ||
        !form.email.trim() ||
        !form.password.trim() ||
        !form.confirmPassword.trim() ||
        !!errors.username ||
        !!errors.email ||
        !!errors.password ||
        !!errors.confirmPassword;


    return (
        <div className="center-page" style={{ background: colors.mainBg }}>
            <div className="card" style={{ width: "100%", maxWidth: 450 }}>
                {/* <h2 style={{ textAlign: "center", marginBottom: 12 }}>Create account</h2> */}

                {/* Profile Image */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <img
                        src={profileImage}
                        alt="profile"
                        onClick={handleProfileClick}
                        style={{ width: 100, height: 100, borderRadius: "50%", cursor: "pointer", objectFit: "cover" }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleProfileChange}
                        style={{ display: "none" }}
                    />
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* USERNAME */}
                    <InputField
                        icon={FaUser}
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder={t("auth.fullNamePlaceholder")}
                    />
                    {errors.username && (
                        <p style={{ color: "red", fontSize: 13, marginTop: 0, marginBottom: 0 }}>
                            {errors.username}
                        </p>
                    )}


                    {/* EMAIL */}
                    <InputField
                        icon={FaEnvelope}
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@gmail.com"
                    />
                    {errors.email && <p style={{ color: "red", fontSize: 13, marginTop: 0, marginBottom: 0 }}>{errors.email}</p>}

                    {/* PASSWORD */}
                    <div style={{ position: "relative" }}>
                        <InputField
                            icon={FaLock}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="*******"
                            type={showPassword ? "text" : "password"}
                        />
                        <span
                            onClick={() => setShowPassword((s) => !s)}
                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: colors.red, cursor: "pointer" }}
                        >
                            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                        </span>
                    </div>
                    {errors.password && <p style={{ color: "red", fontSize: 13, marginTop: 0, marginBottom: 0 }}>{errors.password}</p>}

                    {/* CONFIRM PASSWORD */}
                    <div style={{ position: "relative" }}>
                        <InputField
                            icon={FaLock}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder={t("auth.confirmPasswordPlaceholder")}
                            type={showConfirmPassword ? "text" : "password"}
                        />
                        <span
                            onClick={() => setShowConfirmPassword((s) => !s)}
                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: colors.red, cursor: "pointer" }}
                        >
                            {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                        </span>
                    </div>
                    {errors.confirmPassword && <p style={{ color: "red", fontSize: 13, marginTop: 0, marginBottom: 0 }}>{errors.confirmPassword}</p>}
                    <button
                        className="btn-primary"
                        type="submit"
                        disabled={loading || isFormInvalid}
                        style={{
                            background: isFormInvalid ? "#9ca3af" : colors.red,
                            cursor: isFormInvalid ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? t("auth.creatingButton") : t("auth.signupButton")}
                    </button>
                </form>

                {/* Or Google Signup */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
                    <div style={{ flex: 1, height: 1, background: "#374151" }} />
                    <div className="small-muted">{t("auth.orSeparator")}</div>
                    <div style={{ flex: 1, height: 1, background: "#374151" }} />
                </div>

                <GoogleButton onClick={handleGoogle} />

                <div style={{ textAlign: "center", marginTop: 6 }}>
                    {t("auth.alreadyHaveAccount")} <Link to="/login" style={{ color: colors.red }}>{t("auth.loginButton")}</Link>
                </div>
            </div>
        </div>
    );
}
