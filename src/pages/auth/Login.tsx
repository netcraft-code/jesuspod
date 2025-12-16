import { useState } from "react";
import { FaEnvelope, FaLock, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import GoogleButton from "../../components/UI/GoogleButton";
import colors from "../../theme/colors";
import { useDispatch } from "react-redux";
import { authStart, authSuccess, authFailure } from "../../redux/authSlice";
import { loginWithEmail } from "../../services/authService";
import { loginWithGoogle as loginGoogleFn } from "../../services/authService";
import logo from "../../assets/logo.png";
import InputField from "../../components/UI/InputField";
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
            dispatch(fetchInitialData());
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

            dispatch(fetchInitialData());

            navigate("/home");
        } catch (err: any) {
            alert("Invalid Credential")
            dispatch(authFailure(err.message));
        }
    };

    const inputs = [
        {
            name: "email",
            placeholder: "john@gmail.com",
            icon: FaEnvelope,
            type: "text",
            error: errors.email,
        },
        {
            name: "password",
            placeholder: "*******",
            icon: FaLock,
            type: showPwd ? "text" : "password",
            error: errors.password,
            eyeToggle: true,
            showValue: showPwd,
            setShowValue: setShowPwd,
        },
    ];

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
        <div className="center-page" style={{ background: colors.mainBg }}>
            <div className="card" style={{ width: "100%", maxWidth: 450 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <img src={logo} alt="logo" style={{ width: 110 }} />
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {inputs.map((input) => (
                        <div key={input.name} style={{ position: "relative" }}>
                            <InputField
                                name={input.name}
                                value={form[input.name as keyof FormType]}
                                onChange={handleChange}
                                placeholder={input.placeholder}
                                icon={input.icon}
                                type={input.type}
                            />
                            {input.eyeToggle && (
                                <span
                                    onClick={() => input.setShowValue((prev) => !prev)}
                                    style={{
                                        position: "absolute",
                                        right: 12,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: colors.red,
                                        cursor: "pointer",
                                    }}
                                >
                                    {input.showValue ? <FaRegEye /> : <FaRegEyeSlash />}
                                </span>
                            )}
                            {input.error && <p style={{ color: "red", marginTop: 8, fontSize: 13 }}>{input.error}</p>}
                        </div>
                    ))}

                    <div style={{ textAlign: "right" }}>
                        <Link to="/forgot" className="small-muted">Forgot Password?</Link>
                    </div>

                    <button
                        className="btn-primary"
                        type="submit"
                        disabled={loading || isFormInvalid}
                        style={{
                            background: isFormInvalid ? "#9ca3af" : colors.red,
                            cursor: isFormInvalid ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Logging..." : "Login"}
                    </button>
                </form>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                    <div style={{ flex: 1, height: 1, background: "#374151" }} />
                    <div className="small-muted">Or</div>
                    <div style={{ flex: 1, height: 1, background: "#374151" }} />
                </div>
                {/* <button
                    onClick={handleApple}
                    className="btn-primary"
                    style={{ background: "#000", marginTop: 12 }}
                >
                     Sign in with Apple
                </button> */}

                <GoogleButton onClick={handleGoogle} />

                <div style={{ textAlign: "center", marginTop: 6 }}>
                    Don’t have an account? <Link to="/signup" style={{ color: colors.red }}>Signup</Link>
                </div>
            </div>
        </div>
    );
}
