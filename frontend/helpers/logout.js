export default function logout(recipient = true) {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');

  if (recipient) {
    localStorage.removeItem('recipientRef');
  }
}
