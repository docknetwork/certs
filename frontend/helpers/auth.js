import { useEffect, useState, useCallback } from 'react';
import { getUser } from '../services/api';

function getLocalUser() {
  let authUser;
  const authUserStr = localStorage.getItem('authUser');
  if (authUserStr) {
    try {
      authUser = JSON.parse(localStorage.getItem('authUser'));
    } catch (e) {
      authUser = null;
    }
  }
  return authUser;
}

export async function getUserFromApi() {
  const token = localStorage.getItem('authToken');
  if (token) {
    const user = await getUser();
    localStorage.setItem('authUser', JSON.stringify(user));
    return user;
  }
}

export function hasAuthToken() {
  return !!localStorage.getItem('authToken');
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
}

export function useAuthed() {
  const [user, setUser] = useState(typeof window !== 'undefined' ? getLocalUser() : null);
  async function loadUser() {
    const u = await getUserFromApi();
    setUser(u);
  }

  const forceUpdate = useCallback(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  return [user, forceUpdate];
}
