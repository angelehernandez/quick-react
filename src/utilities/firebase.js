import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref, set } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAsrRnoqag7YXCwwJ3drIMPj3JNCk_PAm4",
    authDomain: "quick-react-87e18.firebaseapp.com",
    databaseURL: "https://quick-react-87e18-default-rtdb.firebaseio.com",
    projectId: "quick-react-87e18",
    storageBucket: "quick-react-87e18.appspot.com",
    messagingSenderId: "897444803594",
    appId: "1:897444803594:web:203790ed784280cfa79bf3",
    measurementId: "G-NGTGFQ9S9E"
  };

const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);

export const setData = (path, value) => (
    set(ref(database, path), value)
);

export const useData = (path, transform) => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
  
    useEffect(() => {
      const dbRef = ref(database, path);
      const devMode = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
      if (devMode) { console.log(`loading ${path}`); }
      return onValue(dbRef, (snapshot) => {
        const val = snapshot.val();
        if (devMode) { console.log(val); }
        setData(transform ? transform(val) : val);
        setLoading(false);
        setError(null);
      }, (error) => {
        setData(null);
        setLoading(false);
        setError(error);
      });
    }, [path, transform]);
  
    return [data, loading, error];
  };