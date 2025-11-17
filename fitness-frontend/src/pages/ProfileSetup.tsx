import { useState } from 'react';
import { userService, type UserProfile } from '../services/user';

interface ProfileSetupProps {
  telegramId: string;
  onComplete: () => void;
  onBack: () => void;
}

export const ProfileSetup = ({ telegramId, onComplete, onBack }: ProfileSetupProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    fitnessLevel: undefined,
    primaryGoal: undefined,
    preferredWorkoutDays: [],
    preferredDuration: undefined,
    availableEquipment: [],
    injuries: '',
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const equipment = ['dumbbells', 'barbell', 'resistance_bands', 'treadmill', 'bench', 'pullup_bar', 'kettlebell', 'bodyweight'];

  const toggleDay = (day: string) => {
    const current = profile.preferredWorkoutDays || [];
    if (current.includes(day)) {
      setProfile({ ...profile, preferredWorkoutDays: current.filter(d => d !== day) });
    } else {
      setProfile({ ...profile, preferredWorkoutDays: [...current, day] });
    }
  };

  const toggleEquipment = (item: string) => {
    const current = profile.availableEquipment || [];
    if (current.includes(item)) {
      setProfile({ ...profile, availableEquipment: current.filter(e => e !== item) });
    } else {
      setProfile({ ...profile, availableEquipment: [...current, item] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Submitting profile:', profile);
    console.log('Telegram ID:', telegramId);

    try {
      const result = await userService.updateProfile(telegramId, profile);
      console.log('Profile saved successfully:', result);
      setSuccess(true);
      setTimeout(() => {
        console.log('Calling onComplete');
        onComplete();
      }, 1500);
    } catch (err: any) {
      console.error('Profile save error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save profile';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = (isSelected: boolean) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: '2px solid',
    borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
    backgroundColor: isSelected ? '#3b82f6' : 'white',
    color: isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  });

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ color: '#10b981', margin: '0 0 8px 0' }}>Profile Saved!</h2>
        <p style={{ color: '#6b7280' }}>Redirecting...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#3b82f6',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '8px 0',
          marginBottom: '16px',
        }}
      >
        ← Back
      </button>

      <h2 style={{ margin: '0 0 24px 0', color: '#1f2937' }}>Set Up Your Profile</h2>

      <form onSubmit={handleSubmit}>
        {/* Fitness Level */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Fitness Level *
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setProfile({ ...profile, fitnessLevel: level })}
                style={buttonStyle(profile.fitnessLevel === level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Goal */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Primary Goal *
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {([
              { value: 'lose_weight', label: 'Lose Weight' },
              { value: 'build_muscle', label: 'Build Muscle' },
              { value: 'increase_endurance', label: 'Endurance' },
              { value: 'strength_training', label: 'Strength' },
              { value: 'general_fitness', label: 'General Fitness' },
            ] as const).map(goal => (
              <button
                key={goal.value}
                type="button"
                onClick={() => setProfile({ ...profile, primaryGoal: goal.value })}
                style={buttonStyle(profile.primaryGoal === goal.value)}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workout Days */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Workout Days * (select multiple)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {days.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                style={buttonStyle(profile.preferredWorkoutDays?.includes(day) || false)}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Session Duration * (minutes)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[20, 30, 45, 60, 90].map(duration => (
              <button
                key={duration}
                type="button"
                onClick={() => setProfile({ ...profile, preferredDuration: duration })}
                style={buttonStyle(profile.preferredDuration === duration)}
              >
                {duration} min
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Available Equipment (optional)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {equipment.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => toggleEquipment(item)}
                style={buttonStyle(profile.availableEquipment?.includes(item) || false)}
              >
                {item.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Injuries */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Injuries or Limitations (optional)
          </label>
          <textarea
            value={profile.injuries}
            onChange={(e) => setProfile({ ...profile, injuries: e.target.value })}
            placeholder="e.g., Lower back pain, knee issues..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '2px solid #e5e7eb',
              fontSize: '14px',
              minHeight: '80px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '6px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !profile.fitnessLevel || !profile.primaryGoal || !profile.preferredWorkoutDays?.length || !profile.preferredDuration}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading || !profile.fitnessLevel || !profile.primaryGoal || !profile.preferredWorkoutDays?.length || !profile.preferredDuration ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading || !profile.fitnessLevel || !profile.primaryGoal || !profile.preferredWorkoutDays?.length || !profile.preferredDuration ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

