import React from 'react';

// Color palettes tailored for medical / clinical interfaces
const AVATAR_COLORS = [
  { bg: '#2563EB', text: '#FFFFFF', border: '#1D4ED8' }, // Blue
  { bg: '#0D9488', text: '#FFFFFF', border: '#0F766E' }, // Teal
  { bg: '#059669', text: '#FFFFFF', border: '#047857' }, // Emerald
  { bg: '#7C3AED', text: '#FFFFFF', border: '#6D28D9' }, // Purple
  { bg: '#D97706', text: '#FFFFFF', border: '#B45309' }, // Amber
  { bg: '#DB2777', text: '#FFFFFF', border: '#BE185D' }, // Pink
  { bg: '#4F46E5', text: '#FFFFFF', border: '#4338CA' }, // Indigo
  { bg: '#EA580C', text: '#FFFFFF', border: '#C2410C' }, // Orange
  { bg: '#0284C7', text: '#FFFFFF', border: '#0369A1' }, // Sky
];

export const Avatar = ({
  firstName = '',
  lastName = '',
  name = '',
  username = '',
  size = 40,
  fontSize = null,
  role = null,
  className = '',
  style = {},
  showStatus = false,
  statusColor = '#10B981',
}) => {
  // Determine the display letter (first letter of first name or name)
  let rawName = (firstName || name || username || 'U').trim();
  // Strip "Dr." or "Prof." prefixes if present
  rawName = rawName.replace(/^(Dr\.|Prof\.|Doctor|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
  const letter = (rawName.charAt(0) || 'U').toUpperCase();

  // Pick deterministic color based on char code sum
  let sum = 0;
  for (let i = 0; i < rawName.length; i++) {
    sum += rawName.charCodeAt(i);
  }
  const colorScheme = AVATAR_COLORS[sum % AVATAR_COLORS.length];

  const calculatedFontSize = fontSize || Math.max(12, Math.round(size * 0.44));

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${colorScheme.bg} 0%, ${colorScheme.border} 100%)`,
        color: colorScheme.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: `${calculatedFontSize}px`,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        border: '2px solid #FFFFFF',
        userSelect: 'none',
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
      title={name || `${firstName} ${lastName}` || username}
    >
      {letter}
      {showStatus && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(8, Math.round(size * 0.28)),
            height: Math.max(8, Math.round(size * 0.28)),
            borderRadius: '50%',
            backgroundColor: statusColor,
            border: '2px solid #FFFFFF',
          }}
        />
      )}
    </div>
  );
};
export default Avatar;
