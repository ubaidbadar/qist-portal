import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input, { type InputProps } from './input';

export default function PasswordInput(props: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          className="rounded-small text-muted hover:text-ink transition-colors cursor-pointer"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  );
}
