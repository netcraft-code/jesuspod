import "./style.css";

/* 🔹 Props types */
interface ProfileButtonProps {
  letter: string;
  onClick: () => void;
}

export default function ProfileButton({
  letter,
  onClick,
}: ProfileButtonProps) {
  return (
    <div
      className="profile-circle"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label="Profile menu"
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
    >
      {letter}
    </div>
  );
}
