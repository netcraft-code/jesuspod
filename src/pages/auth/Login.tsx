import { useState } from "react";
import { FaEnvelope, FaLock, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import colors from "../../theme/colors";
import { useDispatch } from "react-redux";
import { authStart, authSuccess, authFailure } from "../../redux/authSlice";
import { loginWithEmail } from "../../services/authService";
import { loginWithGoogle as loginGoogleFn } from "../../services/authService";

import usePageTitle from "../../hooks/usePageTitle";
import { fetchInitialData } from "../../redux/dataSlice";
import type { AppDispatch } from "../../redux/store";
type FormType = {
    email: string;
    password: string;
};
export default function Login() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    usePageTitle("Login");

    const [showPwd, setShowPwd] = useState(false);
    const [form, setForm] = useState<FormType>({ email: "", password: "" });

    // Validation state
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    // Email validation function
    const validateEmailFormat = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setForm({ ...form, [name]: value });

        // live validation
        if (name === "email") {
            if (!value.trim()) {
                setErrors((prev) => ({ ...prev, email: "Please enter email" }));
            } else if (!validateEmailFormat(value)) {
                setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
            } else {
                setErrors((prev) => ({ ...prev, email: "" }));
            }
        }

        if (name === "password") {
            if (!value.trim()) {
                setErrors((prev) => ({ ...prev, password: "Please enter password" }));
            } else {
                setErrors((prev) => ({ ...prev, password: "" }));
            }
        }


    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // final validation before submit
        if (!form.email.trim()) {
            return setErrors((prev) => ({ ...prev, email: "Please enter email" }));
        }
        if (!validateEmailFormat(form.email)) {
            return setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
        }
        if (!form.password.trim()) {
            return setErrors((prev) => ({ ...prev, password: "Please enter password" }));
        }

        dispatch(authStart());
        setLoading(true);

        try {
            const res = await loginWithEmail(form.email, form.password);
            const user = res.user;
            const token = await user.getIdToken();
            localStorage.setItem("token", token);
            dispatch(authSuccess({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL, }));
            dispatch(fetchInitialData(user.uid) as any);
            navigate("/home");
        } catch (err: any) {
            alert("Invalid Credential")
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
            dispatch(
                authSuccess({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                })
            );

            dispatch(fetchInitialData(user.uid) as any);

            navigate("/home");
        } catch (err: any) {
            alert("Invalid Credential")
            dispatch(authFailure(err.message));
        }
    };



    // const handleApple = async () => {
    //     dispatch(authStart());
    //     try {
    //         const res = await loginWithApple();
    //         const user = res.user;
    //         const token = await user.getIdToken();

    //         localStorage.setItem("token", token);

    //         dispatch(
    //             authSuccess({
    //                 uid: user.uid,
    //                 email: user.email,
    //                 displayName: user.displayName,
    //                 photoURL: user.photoURL,
    //             })
    //         );

    //         navigate("/home");
    //     } catch (err) {
    //         alert("Login failed");
    //         console.error(err.message)
    //         dispatch(authFailure(err.message));
    //     }
    // };

    // Disable button if any field empty OR has errors
    const isFormInvalid: boolean =
        !form.email.trim() ||
        !form.password.trim() ||
        !!errors.email ||
        !!errors.password;


    return (
        <div className="center-page" style={{ background: "#000000", color: "#ffffff" }}>
            <div className="login-card" style={{
                width: "100%",
                maxWidth: 480,
                backgroundColor: "#1a1a1a",
                padding: "48px 40px",
                borderRadius: "32px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
            }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Login to Account</h1>
                    <p style={{ color: "#9ca3af", fontSize: 16 }}>Login now and access all features now</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="input-group">
                        <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Email Address</label>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: colors.red }}>
                                <FaEnvelope size={18} />
                            </span>
                            <input
                                name="email"
                                type="text"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="johndoe@gmai.com"
                                style={{
                                    width: "100%",
                                    backgroundColor: "transparent",
                                    border: "1px solid #374151",
                                    borderRadius: "16px",
                                    padding: "16px 16px 16px 48px",
                                    color: "#ffffff",
                                    fontSize: 15,
                                    outline: "none"
                                }}
                            />
                        </div>
                        {errors.email && <p style={{ color: "red", marginTop: 4, fontSize: 12 }}>{errors.email}</p>}
                    </div>

                    <div className="input-group">
                        <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Password</label>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: colors.red }}>
                                <FaLock size={18} />
                            </span>
                            <input
                                name="password"
                                type={showPwd ? "text" : "password"}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="*****************"
                                style={{
                                    width: "100%",
                                    backgroundColor: "transparent",
                                    border: "1px solid #374151",
                                    borderRadius: "16px",
                                    padding: "16px 48px",
                                    color: "#ffffff",
                                    fontSize: 15,
                                    outline: "none"
                                }}
                            />
                            <span
                                onClick={() => setShowPwd(!showPwd)}
                                style={{
                                    position: "absolute",
                                    right: 16,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#4b5563",
                                    cursor: "pointer",
                                }}
                            >
                                {showPwd ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                            </span>
                        </div>
                        {errors.password && <p style={{ color: "red", marginTop: 4, fontSize: 12 }}>{errors.password}</p>}
                    </div>

                    <div style={{ textAlign: "right", marginTop: -8 }}>
                        <Link to="/forgot" style={{ color: colors.red, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Forgot Password?</Link>
                    </div>

                    <button
                        className="login-btn"
                        type="submit"
                        disabled={loading || isFormInvalid}
                        style={{
                            background: isFormInvalid ? "#374151" : "#ff2b2b",
                            color: isFormInvalid ? "#9ca3af" : "#ffffff",
                            padding: "16px",
                            borderRadius: "16px",
                            border: "none",
                            fontSize: 18,
                            fontWeight: 700,
                            cursor: isFormInvalid ? "not-allowed" : "pointer",
                            marginTop: 12,
                            boxShadow: isFormInvalid ? "none" : "0 4px 14px rgba(255, 43, 43, 0.3)"
                        }}
                    >
                        {loading ? "Logging..." : "Login"}
                    </button>
                </form>

                <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "32px 0" }}>
                    <div style={{ flex: 1, height: 1, background: "#374151" }} />
                    <div style={{ color: "#ffffff", fontSize: 14 }}>Or</div>
                    <div style={{ flex: 1, height: 1, background: "#374151" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                    <div onClick={handleGoogle} style={{
                        width: 56, height: 56, borderRadius: "50%", backgroundColor: "#2d2d2d",
                        display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer"
                    }}>
                        <FcGoogle size={28} />
                    </div>

                </div>

                <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#9ca3af" }}>
                    Don’t have an account? <Link to="/signup" style={{ color: colors.red, fontWeight: 600, textDecoration: "none" }}>Signup</Link>
                </div>
            </div>
        </div>
    );
}
