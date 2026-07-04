import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  icon?: ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "flex items-center justify-center gap-2 font-semibold rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-katha-gold hover:bg-katha-goldLight text-katha-indigo shadow-lg shadow-katha-gold/20",
    secondary:
      "bg-katha-plum hover:bg-katha-indigoLight text-katha-cream border border-katha-gold/20",
    outline:
      "bg-transparent border-2 border-katha-gold/50 text-katha-gold hover:bg-katha-gold/10",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}