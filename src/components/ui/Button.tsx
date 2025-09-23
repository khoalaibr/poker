import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Definimos las props que el botón puede recibir
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  // CAMBIO: Ahora 'variant' puede ser 'primary' o 'secondary'.
  // Lo hacemos opcional y le daremos un valor por defecto.
  variant?: 'primary' | 'secondary';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  // Asignamos 'primary' como valor por defecto para la variante
  ({ children, className, variant = 'primary', ...props }, ref) => {
    const buttonClasses = twMerge(
      clsx(
        'inline-flex items-center justify-center rounded-md px-4 py-2 font-semibold tracking-wide text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        {
          // Estilos para la variante primaria
          'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500': variant === 'primary',
          // NUEVO: Estilos para la variante secundaria
          'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500': variant === 'secondary',
        },
        className
      )
    );

    return (
      <button className={buttonClasses} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

