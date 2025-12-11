import { IconBrandGoogle } from "@tabler/icons-react";
import colors from "../../theme/colors";
interface GoogleButtonProps {
    onClick: () => void; // onClick function type define karo
}
export default function GoogleButton({ onClick }: GoogleButtonProps) {
    return (
        <button onClick={onClick} className="btn-primary" style={{ display: "flex", width: "100%", alignItems: "center", gap: 8, marginTop: 12, marginBottom: 12, justifyContent: "center", background: "#fff", color: "#000" }}>
            <IconBrandGoogle size={20} color={colors.red} />
            <span>Continue with Google</span>
        </button>
    );
}
