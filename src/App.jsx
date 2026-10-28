import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import Register from './Register';
import Login from './Login';
import Profile from './Profile';

const DEMO_USER = {
  nev: 'Kovács Anna',
  email: 'kovacs.anna@egyetem.hu',
  jelszo: 'Biztonsagos123!',
};

function PortalShell({ user }) {
  const navigate = useNavigate();
  const [demoPreset, setDemoPreset] = useState(null);
  const [infoBanner, setInfoBanner] = useState('');

  const handleGyorsRegisztracio = async () => {
    setInfoBanner('');
    if (user) {
      await signOut(auth);
    }
    setDemoPreset({
      type: 'quick-register',
      nev: DEMO_USER.nev,
      email: DEMO_USER.email,
      jelszo: DEMO_USER.jelszo,
    });
    navigate('/register');
  };

  const handleRosszJelszo = async () => {
    setInfoBanner('');
    if (user) {
      await signOut(auth);
    }
    setDemoPreset({
      type: 'wrong-password',
      email: DEMO_USER.email,
      jelszo: 'HibasJelszo000!',
    });
    navigate('/login');
  };

  const handleHelyesBelepes = async () => {
    setInfoBanner('');
    try {
      await signInWithEmailAndPassword(auth, DEMO_USER.email, DEMO_USER.jelszo);
      navigate('/profile');
    } catch (err) {
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          DEMO_USER.email,
          DEMO_USER.jelszo
        );
        await updateProfile(cred.user, { displayName: DEMO_USER.nev });
        await setDoc(doc(db, 'profilok', cred.user.uid), {
          nev: DEMO_USER.nev,
          email: cred.user.email,
          letrehozva: serverTimestamp(),
        });
        navigate('/profile');
      } catch (innerErr) {
        navigate('/login');
      }
    }
  };

  const handleMunkamenetFixacio = () => {
    setInfoBanner(
      'Munkamenet-fixáció elleni védelem: Belépéskor a Firebase Authentication új, kriptográfiailag aláírt JWT ID tokent állít ki (a PHP-s session_regenerate_id(true) megfelelője), így egy előre rögzített munkamenet-azonosító nem használható fel.'
    );
  };

  const handleProfilVedett = () => {
    if (!user) {
      setInfoBanner(
        'Védett oldal: Nincs aktív munkamenet, ezért a rendszer automatikusan átirányított a bejelentkezési oldalra!'
      );
      navigate('/login');
    } else {
      setInfoBanner('');
      navigate('/profile');
    }
  };

  return (
    <div className="portal-shell">
      {/* Gyorsműveleti gombok sávja */}
      <div className="portal-toolbar">
        <button type="button" className="pill-btn" onClick={handleGyorsRegisztracio}>
          Gyors regisztráció
        </button>
        <button type="button" className="pill-btn" onClick={handleRosszJelszo}>
          Rossz jelszó
        </button>
        <button
          type="button"
          className="pill-btn pill-btn-green"
          onClick={handleHelyesBelepes}
        >
          Helyes belépés
        </button>
        <button
          type="button"
          className="pill-btn pill-btn-red"
          onClick={handleMunkamenetFixacio}
        >
          Munkamenet-fixáció
        </button>
        <button type="button" className="pill-btn" onClick={handleProfilVedett}>
          Profil (védett)
        </button>
      </div>

      {/* Tartalmi terület */}
      <div className="portal-viewport">
        {infoBanner && (
          <div
            className="portal-alert portal-alert-info"
            style={{ width: '100%', maxWidth: '430px' }}
          >
            {infoBanner}
          </div>
        )}

        <Routes>
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/profile" replace />
              ) : (
                <Register
                  demoPreset={demoPreset}
                  onClearPreset={() => setDemoPreset(null)}
                />
              )
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/profile" replace />
              ) : (
                <Login
                  demoPreset={demoPreset}
                  onClearPreset={() => setDemoPreset(null)}
                />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user ? <Profile user={user} /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="*"
            element={<Navigate to={user ? '/profile' : '/register'} replace />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authBetoltes, setAuthBetoltes] = useState(true);

  // Auth állapot figyelése useEffect hookon belül az onAuthStateChanged segítségével
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthBetoltes(false);
    });

    return () => unsubscribe();
  }, []);

  if (authBetoltes) {
    return (
      <div className="portal-shell">
        <div className="portal-viewport">
          <div className="portal-card">
            <h1 className="portal-title">Betöltés...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <PortalShell user={user} />
    </BrowserRouter>
  );
}
