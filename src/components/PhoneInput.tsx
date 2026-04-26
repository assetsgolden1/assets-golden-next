'use client'

import { useState } from 'react'
import { PHONE_COUNTRIES, DEFAULT_COUNTRY } from '@/lib/constants/countryPhones'

interface PhoneInputProps {
  value: string
  onChange: (phone: string, country: string, prefix: string) => void
  required?: boolean
  placeholder?: string
}

export function PhoneInput({
  value,
  onChange,
  required = false,
  placeholder = '600 000 000',
}: PhoneInputProps) {
  const [country, setCountry] = useState<typeof PHONE_COUNTRIES[number]>(DEFAULT_COUNTRY)

  function handleCountryChange(code: string) {
    const newCountry = PHONE_COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY
    setCountry(newCountry)
    onChange(value, newCountry.name, newCountry.prefix)
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value, country.name, country.prefix)
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ position: 'relative', width: 90, minWidth: 90, maxWidth: 90, flexShrink: 0 }}>
        <select
          value={country.code}
          onChange={(e) => handleCountryChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 20px 10px 6px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            fontSize: 13,
            backgroundColor: 'white',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {PHONE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.prefix}
            </option>
          ))}
        </select>
        <span style={{
          position: 'absolute', right: 4, top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 10, color: '#6b7280',
          pointerEvents: 'none',
        }}>▾</span>
      </div>
      <input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        required={required}
        style={{
          flex: 1,
          padding: '10px 12px',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
          fontSize: 14,
        }}
      />
    </div>
  )
}
