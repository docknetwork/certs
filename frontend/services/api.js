import fetch from 'isomorphic-unfetch';
import { logout } from '../helpers/auth';
import Router from 'next/router';

function queryParams(params) {
  if (!params) {
    return '';
  }
  return `?${Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')}`;
}

function getAuthedHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    Authorization: `${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

export async function getUser() {
  try {
    const userData = await apiGet('user');
    return userData.authorized && userData.user;
  } catch (e) {
    logout();
    Router.push('/');
  }
}

export async function apiGet(route, params) {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${route}${queryParams(params)}`, {
    headers: getAuthedHeaders(),
  });

  const json = await request.json();
  if (json.status === 500) {
    throw new Error(json.message);
  }
  return json;
}

export async function apiDelete(route, data) {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${route}`, {
    method: 'DELETE',
    headers: getAuthedHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  const json = await request.json();
  if (json.status === 500) {
    throw new Error(json.message);
  }
  return json;
}

export async function apiPost(route, data) {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${route}`, {
    method: 'POST',
    headers: getAuthedHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  const json = await request.json();
  if (json.status === 500) {
    throw new Error(json.message);
  }
  return json;
}

export async function apiPut(route, data) {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${route}`, {
    method: 'PUT',
    headers: getAuthedHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  const json = await request.json();
  if (json.status === 500) {
    throw new Error(json.message);
  }
  return json;
}
