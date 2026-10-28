import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

export default function Profile({ user }) {
  const [nev, setNev] = useState('');
  const [ujNev, setUjNev] = useState('');
  const [betoltes, setBetoltes] = useState(true);
  const [hiba, setHiba] = useState('');
  const [uzenet, setUzenet] = useState('');
  const [mentesAlatt, setMentesAlatt] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let aktiv = true;

    const profilBetoltese = async () => {
      setBetoltes(true);
      setHiba('');
      try {
        const docRef = doc(db, 'profilok', user.uid);
        const docSnap = await getDoc(docRef);

        if (!aktiv) return;

        if (docSnap.exists()) {
          const adatok = docSnap.data();
          setNev(adatok.nev || user.displayName || 'Hallgató');
          setUjNev(adatok.nev || user.displayName || '');
        } else {
          setNev(user.displayName || 'Hallgató');
          setUjNev(user.displayName || '');
        }
      } catch (err) {
        if (aktiv) {
          setHiba('Nem sikerült betölteni a profiladatokat a Firestore-ból.');
          setNev(user.displayName || 'Hallgató');
        }
      } finally {
        if (aktiv) {
          setBetoltes(false);
        }
      }
    };

    profilBetoltese();

    return () => {
      aktiv = false;
    };
  }, [user, navigate]);

  const handleNevModositas = async (e) => {
    e.preventDefault();
    setHiba('');
    setUzenet('');

    const tisztaUjNev = ujNev.trim();
    if (tisztaUjNev.length < 2 || tisztaUjNev.length > 80) {
      setHiba('A névnek 2 és 80 karakter között kell lennie.');
      return;
    }

    setMentesAlatt(true);
    try {
      const docRef = doc(db, 'profilok', user.uid);
      await updateDoc(docRef, {
        nev: tisztaUjNev,
      });
      await updateProfile(user, { displayName: tisztaUjNev });

      setNev(tisztaUjNev);
      setUzenet('A név sikeresen frissítve!');
    } catch (err) {
      setHiba('Hiba történt a név módosítása közben.');
    } finally {
      setMentesAlatt(false);
    }
  };

  const handleKijelentkezes = async () => {
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (err) {
      setHiba('Hiba történt a kijelentkezés során.');
    }
  };

  if (betoltes) {
    return (
      <div className="portal-card">
        <PortalBadgeIcon />
        <h1 className="portal-title">Profil betöltése...</h1>
      </div>
    );
  }

  return (
    <div className="portal-card">
      <PortalBadgeIcon />
      <h1 className="portal-title">Szia, {nev}!</h1>

      <div className="profile-box">
        <div className="profile-row">
          <span className="profile-label">E-mail:</span>
          <span className="profile-val">{user?.email}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Auth UID:</span>
          <code className="profile-uid">{user?.uid}</code>
        </div>
      </div>

      {hiba && (
        <div className="portal-alert portal-alert-error" role="alert">
          {hiba}
        </div>
      )}

      {uzenet && (
        <div className="portal-alert portal-alert-success" role="status">
          {uzenet}
        </div>
      )}

      <form onSubmit={handleNevModositas} className="portal-form">
        <div className="form-group">
          <label htmlFor="ujNev">Név módosítása (Firestore update)</label>
          <input
            id="ujNev"
            type="text"
            value={ujNev}
            onChange={(e) => setUjNev(e.target.value)}
            minLength={2}
            maxLength={80}
            required
          />
        </div>
        <button
          type="submit"
          className="secondary-btn"
          disabled={mentesAlatt || ujNev.trim() === nev}
        >
          {mentesAlatt ? 'Mentés...' : 'Név mentése'}
        </button>
      </form>

      <hr className="portal-divider" />

      <button
        type="button"
        onClick={handleKijelentkezes}
        className="danger-btn"
      >
        Kijelentkezés
      </button>
    </div>
  );
}
