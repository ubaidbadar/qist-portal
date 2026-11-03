import { useState } from 'react';
import { Lock, Mail, Search } from 'lucide-react';
import { Card, Checkbox, Input, Label, PasswordInput, Radio, Select, Textarea, Toggle } from '../ui';
import Section from './section';

const TONE_PROFILES = [
  { value: 'acoustic', label: 'Warm Acoustic & Chamber' },
  { value: 'electronic', label: 'Crisp Ambient Electronic' },
  { value: 'orchestral', label: 'Full Classical Symphonic' },
  { value: 'lofi', label: 'Analog Vintage Lo-Fi' },
];

const TIERS = [
  { value: 'standard', label: 'Standard Tier' },
  { value: 'pro', label: 'Master Pro Tier' },
];

export default function FormControlsSection() {
  return (
    <Section title="Form Controls & Inputs" aside="Accessible useId & ref bindings">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AccountFields />
        <PreferenceFields />
      </div>
    </Section>
  );
}

// Fields are uncontrolled unless their value is read during render (the email validation).
function AccountFields() {
  const [email, setEmail] = useState('');
  const emailError = email && !email.includes('@') ? 'Please provide a valid email address.' : undefined;

  return (
    <Card className="space-y-4">
      <Input label="Username" defaultValue="elenarossi" icon={Search} placeholder="Enter username" required />
      <Input
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        placeholder="elena@example.com"
        error={emailError}
      />
      <PasswordInput label="Security Password" defaultValue="supersecret123" icon={Lock} required />
      <Select label="Primary Tone Profile" defaultValue="acoustic" options={TONE_PROFILES} />
    </Card>
  );
}

function PreferenceFields() {
  return (
    <Card className="space-y-4">
      <Textarea
        label="Artist / Creator Biography"
        defaultValue="Curating exceptional auditory experiences with precision."
        placeholder="Tell us about your creative craft..."
        required
      />

      <div className="space-y-3 pt-2">
        <Label>Preferences & Options</Label>
        <div className="flex flex-col gap-2.5">
          <Checkbox label="I accept the Terms of Service and Privacy Policy" defaultChecked />

          <div className="flex items-center gap-4 pt-1">
            {TIERS.map(({ value, label }) => (
              <Radio key={value} name="subscription" value={value} label={label} defaultChecked={value === 'pro'} />
            ))}
          </div>

          <div className="pt-2">
            <Toggle label="Real-time master bus notifications" defaultChecked />
          </div>
        </div>
      </div>
    </Card>
  );
}
