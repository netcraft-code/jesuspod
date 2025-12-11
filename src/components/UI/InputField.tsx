import React, { type ChangeEvent } from "react";
interface InputFieldProps {
  icon?: React.ElementType;           // React component for icon
  placeholder?: string;
  value: any;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  name?: string;
}
export default function InputField({
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
  name,
}: InputFieldProps) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {Icon && <Icon className="icon-left" size={18} />}
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        className={`input ${Icon ? "input-with-icon" : ""}`}
      />
    </div>
  );
}
