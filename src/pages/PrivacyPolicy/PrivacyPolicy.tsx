import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./PrivacyPolicy.css";
import { useTranslation } from "../../context/LanguageContext";

export default function PrivacyPolicy() {
    const { t } = useTranslation();
    const [active, setActive] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <div className="privacy-wrapper">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <main className="privacy-container">
                <div className="privacy-content-wrapper">
                    <h1>{t("privacy.title")}</h1>
                    <div className="policy-section">
                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to <strong>JesusPod</strong> ("we", "our", "us"), operated by <strong>Faith Pleases God Church Corporation</strong>. JesusPod is committed to protecting your privacy and being transparent about how we collect, use, and share information, including our use of third-party services such as <strong>YouTube API Services</strong>.
                        </p>
                        <p>
                            By using JesusPod, you agree to the collection and use of information in accordance with this Privacy Policy.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>2. Information We Collect</h2>
                        <h3>a. Personal Information</h3>
                        <p>We may collect personal information such as:</p>
                        <ul>
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Payment and subscription information</li>
                        </ul>
                        <p>This information is collected when you register for an account, subscribe to services, or make purchases.</p>

                        <h3>b. Usage Data</h3>
                        <p>We collect information about how you interact with the app, including:</p>
                        <ul>
                            <li>Pages visited</li>
                            <li>Content viewed</li>
                            <li>Features used</li>
                            <li>Actions taken within the app</li>
                        </ul>

                        <h3>c. Device & Technical Information</h3>
                        <p>We may collect information directly or indirectly from your device, including:</p>
                        <ul>
                            <li>IP address</li>
                            <li>Device type</li>
                            <li>Operating system</li>
                            <li>Browser type</li>
                            <li>Cookies and similar technologies</li>
                        </ul>
                        <p>These technologies help us operate the app, improve functionality, remember preferences, and analyze usage.</p>
                    </div>

                    <div className="policy-section">
                        <h2>3. Use of YouTube API Services</h2>
                        <p>JesusPod uses <strong>YouTube API Services</strong> to display, access, or interact with YouTube content.</p>
                        <p>By using JesusPod, you acknowledge and agree that:</p>
                        <ul>
                            <li>Your use of YouTube-related features is subject to the <strong>YouTube Terms of Service</strong>: <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">https://www.youtube.com/t/terms</a></li>
                            <li>Google may collect and process data as described in the <strong>Google Privacy Policy</strong>: <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer">http://www.google.com/policies/privacy</a></li>
                        </ul>
                        <p>JesusPod does not control how Google or YouTube independently collect or use your data.</p>
                    </div>

                    <div className="policy-section">
                        <h2>4. How We Use Your Information</h2>
                        <p>We use collected information to:</p>
                        <ul>
                            <li>Provide, operate, and maintain our services</li>
                            <li>Improve and personalize your experience</li>
                            <li>Communicate updates, promotions, and service-related information</li>
                            <li>Process payments and manage subscriptions</li>
                            <li>Ensure compliance with legal and platform requirements</li>
                        </ul>
                    </div>

                    <div className="policy-section">
                        <h2>5. Sharing Your Information</h2>
                        <p>We do not sell your personal information.</p>
                        <p>We may share information only:</p>
                        <ul>
                            <li>With trusted service providers who help operate our app</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect our rights and users' safety</li>
                            <li>With your explicit consent</li>
                        </ul>
                        <p>All third-party service providers are required to safeguard your information.</p>
                    </div>

                    <div className="policy-section">
                        <h2>6. Cookies and Similar Technologies</h2>
                        <p>JesusPod stores, accesses, and collects information on or from users' devices using:</p>
                        <ul>
                            <li>Cookies</li>
                            <li>Local storage</li>
                            <li>Similar tracking technologies</li>
                        </ul>
                        <p>These are used for:</p>
                        <ul>
                            <li>Authentication and session management</li>
                            <li>Remembering user preferences</li>
                            <li>Analytics and performance improvements</li>
                        </ul>
                        <p>You can control cookies through your browser or device settings. Disabling cookies may affect app functionality.</p>
                    </div>

                    <div className="policy-section">
                        <h2>7. Your Rights and Choices</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal information</li>
                            <li>Correct or update your information</li>
                            <li>Request deletion of your data</li>
                            <li>Withdraw consent where applicable</li>
                        </ul>
                        <p>You may exercise these rights through your account settings or by contacting us.</p>
                    </div>

                    <div className="policy-section">
                        <h2>8. Data Security</h2>
                        <p>
                            We implement reasonable technical and organizational measures to protect your personal information from unauthorized access, use, or disclosure. However, no system is completely secure.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>9. Children's Privacy</h2>
                        <p>
                            JesusPod is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If such data is discovered, it will be deleted promptly.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>10. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised effective date. Continued use of JesusPod after changes constitutes acceptance of the updated policy.
                        </p>
                    </div>

                    <div className="policy-section">
                        <h2>11. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                        <p>
                            <strong>Faith Pleases God Church Corporation</strong><br />
                            <strong>Attention</strong>: Kevin Ortiz<br />
                            <strong>Email</strong>: kevin@faithpleasesgod.com
                        </p>
                        <p>By using JesusPod, you consent to this Privacy Policy and agree to its terms.</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
