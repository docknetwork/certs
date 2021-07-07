import { useEffect, useState, useCallback } from 'react';
import Router from 'next/router';
import { getUser } from '../services/api';
import logout from './logout';

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
  throw new Error('No auth token');
}

export function hasAuthToken() {
  return !!localStorage.getItem('authToken');
}

export function useAuthed() {
  const [user, setUser] = useState(typeof window !== 'undefined' ? getLocalUser() : null);
  async function loadUser() {
    try {
      const u = await getUserFromApi();
      setUser(u);
    } catch (e) {
      if (Router.pathname.indexOf('/issuer/') > -1) {
        logout(false);
        setUser(null);
        Router.push('/issuer/');
      }
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
