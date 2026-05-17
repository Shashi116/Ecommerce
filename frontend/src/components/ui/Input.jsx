import React, { useState } from 'react';
import { LuEye, LuEyeClosed } from 'react-icons/lu';

const Input = ({
  label,
  id,
  error,
  helperText,
  className = '',
  inputClassName = '',
  type = 'text',
  ...props
}) => {
  const inputId = id || props.name;

  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === 'password';

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className="input-wrapper">
        <input
          id={inputId}
          type={
            isPasswordField
              ? (showPassword ? 'text' : 'password')
              : type
          }
          className={`form-input ${inputClassName}`.trim()}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {isPasswordField && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? <LuEyeClosed size={12}/> : <LuEye size={12}/>}
          </button>
        )}
      </div>

      {helperText && !error && (
        <span className="form-helper">{helperText}</span>
      )}

      {error && (
        <span className="form-error" id={`${inputId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;