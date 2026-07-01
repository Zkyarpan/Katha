import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon: Icon,
  type = 'button',
  className = ''
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 justify-center";
  
  const variantStyles = {
    primary: "bg-accent-gold text-background-start hover:bg-accent-orange hover:scale-105 glow-gold-hover shadow-lg",
    secondary: "bg-background-end/50 text-cream border-2 border-accent-gold/30 hover:border-accent-gold hover:bg-background-end/70"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}

// Made with Bob
