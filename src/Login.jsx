import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

function PortalBadgeIcon() {
  return (
    <div className="lock-icon-wrapper">
      <div className="icon-badge">
        <svg
          className="lock-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
    </div>
  );
}

export default function Login({ demoPreset, onClearPreset }) {
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const [hiba, setHiba] = useState('');
  const [betoltes, setBetoltes] = useState(false);

  const navigate = useNavigate();

  const bejelentkezesVegrehajtasa = async (celEmail, celJelszo) => {
    setHiba('');
    setBetoltes(true);

    try {
      await signInWithEmailAndPassword(auth, celEmail.trim(), celJelszo);
      navigate('/profile', { replace: true });
    } catch (error) {
      // Fiók-felderítés (User Enumeration) elleni védelem:
      if (error.code === 'auth/too-many-requests') {
        setHiba('Túl sok próbálkozás, próbáld később.');
      } else {
        setHiba('Hibás e-mail vagy jelszó.');
      }
    } finally {
      setBetoltes(false);
    }
  };

  useEffect(() => {
    if (demoPreset?.type === 'wrong-password') {
      setEmail(demoPreset.email);
      setJelszo(demoPreset.jelszo);
      bejelentkezesVegrehajtasa(demoPreset.email, demoPreset.jelszo);
      onClearPreset?.();
    }
  }, [demoPreset, onClearPreset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await bejelentkezesVegrehajtasa(email, jelszo);
  };

  return (
    <div className="portal-card">
      <PortalBadgeIcon />
      <h1 className="portal-title">Belépés</h1>

      {hiba && (
        <div className="portal-alert portal-alert-error" role="alert">
          {hiba}
        </div>
      )}

      <form onSubmit={handleSubmit} className="portal-form" noValidate>
        <div className="form-group">
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-jelszo">Jelszó</label>
          <input
            id="login-jelszo"
            type="password"
            value={jelszo}
            onChange={(e) => setJelszo(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={betoltes}>
          {betoltes ? 'Belépés...' : 'Belépek'}
        </button>
      </form>

      <p className="bottom-text">
        Még nincs fiókod? <Link to="/register">Regisztráció</Link>
      </p>
    </div>
  );
}
