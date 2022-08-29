import onChange from 'on-change';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import axios from 'axios';
import * as yup from 'yup';
import getParse from './rssParser.js';
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

  // getResponse //

  const getResponse = (rss) => {
    const parsedURL = new URL('https://allorigins.hexlet.app/get');
    parsedURL.searchParams.set('disableCache', 'true');
    parsedURL.searchParams.set('url', rss);
    return axios.get(parsedURL.href)
      .then((response) => response.data.contents)
      .catch(() => {
        throw new Error('netWorkError');
      });
  };

  // validate //

  const validate = (link, validateState) => {
    const feedsLinks = validateState.feeds.map(({ feedLink }) => feedLink);
    const schema = yup.string().url('invalidUrl').notOneOf(feedsLinks, 'allreadyExist').required('emptyField');
    return schema.validate(link, { abortEarly: false });
  };

  // controller //

  const updateFeed = (link, feedState, watchedState) => {
    const watched = watchedState;
    return getResponse(link)
      .then((data) => {
        const { feedTitle, feedDescription, posts } = getParse(data);
        const feedsLinks = feedState.feeds.map(({ feedLink }) => feedLink);
        if (!feedsLinks.includes(link)) {
          watched.feeds.unshift({
            feedId: uniqueId(), feedLink: link, feedTitle, feedDescription,
          });
        }
        const currentFeedId = (feedState.feeds.find((feed) => feed.feedLink === link)).feedId;
        const oldPosts = feedState.posts
          .filter(({ feedId }) => feedId === currentFeedId)
          .map(({ postlink }) => postlink);
        const newPosts = posts
          .filter(({ postlink }) => !oldPosts.includes(postlink))
          .map(({ title, description, postlink }) => ({
            feedId: currentFeedId, postId: uniqueId(), title, description, postlink,
          }));
        watched.posts.unshift(...newPosts);
        setTimeout(updateFeed, 5000, link, feedState, watchedState);
      });
  };

  const controller = (controllerState, watchedState, controllerSelectors) => {
    const elements = controllerSelectors;
    const watched = watchedState;

    elements.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const rss = formData.get('url');
      watched.rssForm.state = 'processing';
      validate(rss, controllerState)
        .then(() => updateFeed(rss, controllerState, watchedState))
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

  const watchedUiState = onChange(state.watchedPosts, () => {
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
        postsRender(state, selectors, watchedUiState, i18nInstance);
        uiRender(state.watchedPosts);
        break;
      default:
    }
  });

  controller(state, watchedState, selectors);
};

export default runApp;
