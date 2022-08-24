import onChange from 'on-change';
import i18next from 'i18next';
import controller from './controller.js';
import ru from './locales/ru.js';

const runApp = () => {
  const defaultLanguage = 'ru';
  const state = {
    lng: defaultLanguage,
    rssForm: {
      state: null,
      inputStatus: 'unblocked',
      errors: {},
    },
    feeds: [],
    posts: [],
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: state.lng,
    debug: false,
    resources: {
      ru,
    },
  });

  const selectors = {
    formElement: document.querySelector('.rss-form'),
    formInput: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type="submit"'),
    feedbackElement: document.querySelector('[data-toggle="feedbackText"]'),
    feedContainer: document.querySelector('[data-container="feeds"]'),
    postsContainer: document.querySelector('[data-container="posts"'),
  };

  console.log(selectors.formInput);

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssForm.state':
        selectors.feedbackElement.textContent = value;
        if (value === 'unsuccessfulLoad') {
          selectors.formInput.classList.add('fail');
        }
        break;
      default:
    }
  });

  controller(state, watchedState, selectors);
};

export default runApp;
