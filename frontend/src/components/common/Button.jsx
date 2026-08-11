import React from 'react';
import { Link } from 'react-router-dom';

export const Button = ({
  children,
  to,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-black dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 shadow-sm active:scale-[0.98]',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 active:scale-[0.98]',
    outline: 'bg-transparent text-slate-900 dark:text-white border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 active:scale-[0.98]',
    ghost: 'bg-transparent text-slate-700 hover:text-black dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/60',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-bold',
  };

  const combinedClass = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className={`w-4 h-4 ${size === 'lg' ? 'w-5 h-5' : ''}`} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className={`w-4 h-4 ${size === 'lg' ? 'w-5 h-5' : ''}`} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClass} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClass} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={combinedClass} onClick={onClick} disabled={disabled} {...props}>
      {content}
    </button>
  );
};

export default Button;
