import { useEffect, useState, useCallback } from 'react';
import { getUser } from '../services/api';
import Router from 'next/router';

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
  } else {
    throw new Error('No auth token');
  }
}

export function hasAuthToken() {
  return !!localStorage.getItem('authToken');
}

export function logout(recipient = true) {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');

  if (recipient) {
    localStorage.removeItem('recipientRef');
  }
}

export function useAuthed() {
  const [user, setUser] = useState(typeof window !== 'undefined' ? getLocalUser() : null);
  async function loadUser() {
    try {
      const u = await getUserFromApi();
      setUser(u);
    } catch (e) {
      logout(false);
      setUser(null);
      Router.push('/');
    }
  }

  const forceUpdate = useCallback(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  return [user, forceUpdate];
}
