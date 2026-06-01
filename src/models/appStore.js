export const appStore = {
  getActiveUser: () => {
    const saved = sessionStorage.getItem('activeUser');
    return saved ? JSON.parse(saved) : null;
  },
  setActiveUser: (user) => {
    if (user) {
      sessionStorage.setItem('activeUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('activeUser');
    }
  },
};
