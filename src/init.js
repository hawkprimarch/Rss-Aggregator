import onChange from 'on-change';
import i18next from 'i18next';
import controller from './controller.js';
import ru from './locales/ru.js';

import {
  formRender, postsRender, uiRender, renderFeeds,
} from './view.js';

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
    watchedPosts: {},
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
    inputElement: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    notificationElement: document.querySelector('[data-toggle="feedbackText"]'),
    feedContainer: document.querySelector('[data-container="feeds"]'),
    postsContainer: document.querySelector('[data-container="posts"]'),
  };

  const watchedUIState = onChange(state.watchedPosts, () => {
    uiRender(state.watchedPosts);
  });

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'rssForm.state':
        formRender(state, selectors, i18nInstance);
        break;
      case 'feeds':
        renderFeeds(state, selectors, i18nInstance);
        break;
      case 'posts':
        postsRender(state, selectors, watchedUIState, i18nInstance);
        uiRender(state.watchedPosts);
        break;
      default:
    }
  });

  controller(state, watchedState, selectors);
};

export default runApp;
