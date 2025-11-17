import { useState } from 'react';

interface ExerciseCardProps {
  exercise: any;
  index: number;
  blockType: string;
  colors: {
    bg: string;
    border: string;
    text: string;
  };
  textColor: string;
  mutedColor: string;
  accent: string;
  accentDark: string;
  surface: string;
  buttonTextColor: string;
  withAlpha: (hex: string, alpha: number) => string;
  formatExercise: (exercise: any) => {
    displayName: string;
    details: Array<{ label: string; value: string }>;
    description?: string;
    instructions?: string;
    hasScaling: boolean;
    hasWeight: boolean;
  };
  parseInstructions: (instructions: string) => Array<{ version: string; content: string }>;
}

export const ExerciseCard = ({
  exercise,
  index,
  blockType,
  colors,
  textColor,
  mutedColor,
  accent,
  accentDark,
  surface,
  buttonTextColor,
  withAlpha,
  formatExercise,
  parseInstructions,
}: ExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatted = formatExercise(exercise);
  const showInstructions = blockType === 'wod' && formatted.instructions && formatted.hasScaling;
  
  return (
    <div
      style={{
        backgroundColor: surface,
        border: `1px solid ${withAlpha(textColor, 0.1)}`,
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Exercise Header with Number Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: formatted.details.length > 0 ? '4px' : '0',
      }}>
        <div style={{
          backgroundColor: colors.border,
          color: buttonTextColor,
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 'bold',
          flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <div style={{ fontWeight: '700', fontSize: '16px', color: textColor, flex: 1 }}>
          {formatted.displayName}
        </div>
      </div>
      
      {/* Exercise Details Grid */}
      {formatted.details.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '8px',
          marginLeft: '38px',
        }}>
          {formatted.details.map((detail, idx) => (
            <div key={idx} style={{ fontSize: '13px', color: mutedColor }}>
              <span style={{ fontWeight: '600', color: textColor }}>{detail.label}:</span> {detail.value}
            </div>
          ))}
        </div>
      )}
      
      {/* Exercise Description - More Visible */}
      {formatted.description && (
        <div style={{
          fontSize: '13px',
          color: textColor,
          lineHeight: '1.5',
          marginTop: '6px',
          padding: '10px',
          backgroundColor: withAlpha(colors.border, 0.08),
          borderRadius: '8px',
          fontStyle: 'italic',
          marginLeft: '38px',
        }}>
          💡 {formatted.description}
        </div>
      )}
      
      {/* Collapsible Scaling Instructions (WOD only) */}
      {showInstructions && (
        <div style={{ marginTop: '4px', marginLeft: '38px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              fontSize: '12px',
              color: accent,
              background: 'none',
              border: 'none',
              padding: '4px 0',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textAlign: 'left' as const,
            }}
          >
            <span>{isExpanded ? '▼' : '▶'}</span>
            <span>Scaling Options</span>
          </button>
          {isExpanded && (
            <div style={{
              fontSize: '12px',
              color: mutedColor,
              marginTop: '6px',
              paddingLeft: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              {parseInstructions(formatted.instructions!).map((line, idx) => (
                <div key={idx}>
                  {line.version ? (
                    <span>
                      <span style={{ fontWeight: '600', color: accentDark }}>{line.version}:</span> {line.content}
                    </span>
                  ) : line.content}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

