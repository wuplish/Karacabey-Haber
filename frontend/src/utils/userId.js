export function getOrCreateUserId() {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('user_id', userId);
  }
  return userId;
}
  