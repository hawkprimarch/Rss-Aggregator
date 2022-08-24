import validate from './validate.js';

export default (state, watchedState, selectors) => {
  const elements = selectors;
  const watched = watchedState;
  elements.formElement.focus();

  elements.formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rss = formData.get('url');
    watched.rssForm.state = 'processing';
    validate(rss, state)
      .then(() => {
        watched.rssForm.errors = null;
        watched.rssForm.state = 'successLoad';
      })
      .catch((error) => {
        watched.rssForm.errors = error.message;
        watched.rssForm.state = 'unsuccessfulLoad';
      });
  });
};