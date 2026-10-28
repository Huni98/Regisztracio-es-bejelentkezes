import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

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

export default function Register({ demoPreset, onClearPreset }) {
  const [nev, setNev] = useState('');
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const [jelszoUjra, setJelszoUjra] = useState('');
  const [hiba, setHiba] = useState('');
  const [betoltes, setBetoltes] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (demoPreset?.type === 'quick-register') {
      setNev(demoPreset.nev);
      setEmail(demoPreset.email);
      setJelszo(demoPreset.jelszo);
      setJelszoUjra(demoPreset.jelszo);
      setHiba('');
      onClearPreset?.();
    }
  }, [demoPreset, onClearPreset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHiba('');

    const tisztaNev = nev.trim();
    const tisztaEmail = email.trim();

    if (tisztaNev.length < 2 || tisztaNev.length > 80) {
      setHiba('A névnek 2 és 80 karakter között kell lennie.');
      return;
    }

    if (jelszo.length < 8) {
      setHiba('A jelszónak legalább 8 karakter hosszúnak kell lennie.');
      return;
    }

    if (jelszo !== jelszoUjra) {
      setHiba('A megadott jelszavak nem egyeznek!');
      return;
    }

    setBetoltes(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, tisztaEmail, jelszo);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: tisztaNev,
      });

      await setDoc(doc(db, 'profilok', user.uid), {
        nev: tisztaNev,
        email: user.email,
        letrehozva: serverTimestamp(),
      });

      navigate('/profile', { replace: true });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setHiba('Ezzel az e-maillel már regisztráltak.');
      } else if (error.code === 'auth/invalid-email') {
        setHiba('Érvénytelen e-mail cím formátum.');
      } else if (error.code === 'auth/weak-password') {
        setHiba('A választott jelszó túl gyenge.');
      } else {
        setHiba('Hiba történt a regisztráció során. Kérlek, próbáld újra!');
      }
    } finally {
      setBetoltes(false);
    }
  };

  const jelszoArany = Math.min(100, Math.round((jelszo.length / 10) * 100));
  const jelszoSzin =
    jelszo.length === 0
      ? 'transparent'
      : jelszo.length < 6
        ? '#be123c'
        : jelszo.length < 10
          ? '#d97706'
          : '#0d9488';

  const jelszoNemEgyezik = jelszoUjra.length > 0 && jelszo !== jelszoUjra;

  return (
    <div className="portal-card">
      <PortalBadgeIcon />
      <h1 className="portal-title">Regisztráció</h1>

      {hiba && (
        <div className="portal-alert portal-alert-error" role="alert">
          {hiba}
        </div>
      )}

      <form onSubmit={handleSubmit} className="portal-form" noValidate>
        <div className="form-group">
          <label htmlFor="nev">Név</label>
          <input
            id="nev"
            type="text"
            value={nev}
            onChange={(e) => setNev(e.target.value)}
            minLength={2}
            maxLength={80}
            required
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="jelszo">Jelszó (min. 8 karakter)</label>
          <input
            id="jelszo"
            type="password"
            value={jelszo}
            onChange={(e) => setJelszo(e.target.value)}
            required
            autoComplete="new-password"
          />
          <div className="strength-track" aria-hidden="true">
            <div
              className="strength-fill"
              style={{ width: `${jelszoArany}%`, backgroundColor: jelszoSzin }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="jelszoUjra">Jelszó újra</label>
          <input
            id="jelszoUjra"
            type="password"
            value={jelszoUjra}
            onChange={(e) => setJelszoUjra(e.target.value)}
            required
            autoComplete="new-password"
          />
          {jelszoNemEgyezik && (
            <span className="field-hint error-text">A két jelszó nem egyezik!</span>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={betoltes || jelszoNemEgyezik}
        >
          {betoltes ? 'Regisztráció...' : 'Regisztrálok'}
        </button>
      </form>

      <p className="bottom-text">
        Van már fiókod? <Link to="/login">Belépés</Link>
      </p>
    </div>
  );
}
