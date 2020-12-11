export default function getStorageValue(key) {
  let localRef;
  if (typeof localStorage !== 'undefined') {
    localRef = localStorage.getItem(key);
    if (localRef === 'null' || localRef === 'undefined') {
      localRef = null;
    }
  }
  return localRef;
}
