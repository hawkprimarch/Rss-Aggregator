const formRender = (state, selectors, i18nInstance) => {
  const formState = state.rssForm.state;
  const errors = state.rssForm.errors ? state.rssForm.errors : null;
  selectors.notificationElement.textContent = '';
  selectors.notificationElement.classList.remove('text-danger');
  selectors.notificationElement.classList.remove('text-success');
  selectors.inputElement.classList.remove('is-invalid');
  selectors.inputElement.focus();

  switch (formState) {
    case 'processing':
      selectors.submitButton.disabled = true;
      selectors.inputElement.setAttribute('readonly', 'true');
      break;
    case 'successLoad':
      selectors.notificationElement.classList.add('text-success');
      selectors.notificationElement.textContent = i18nInstance.t(formState);
      selectors.inputElement.value = '';
      selectors.submitButton.disabled = false;
      selectors.inputElement.removeAttribute('readonly');
      break;
    case 'unsuccessfulLoad':
      selectors.notificationElement.classList.add('text-danger');
      selectors.inputElement.classList.add('is-invalid');
      selectors.notificationElement.textContent = i18nInstance.t(errors);
      selectors.submitButton.disabled = false;
      selectors.inputElement.removeAttribute('readonly');
      break;
    default:
      throw new Error('unknownState');
  }
};

const renderModal = (title, link, description) => {
  const modalTitle = document.querySelector('#exampleModalLabel');
  const modalDiscription = document.querySelector('.modal-body');
  const button = document.querySelector('.btn-primary');
  button.href = link;
  modalTitle.textContent = title;
  modalDiscription.textContent = description;
};

const renderFeeds = (state, selectors, i18nInstance) => {
  selectors.feedContainer.innerHTML = '';
  const feedCard = document.createElement('div');
  feedCard.classList.add('card-body-feeds');
  const feedTittle = document.createElement('h3');
  feedTittle.textContent = i18nInstance.t('feeds');
  feedCard.append(feedTittle);
  selectors.feedContainer.append(feedCard);
  const ulElement = document.createElement('ul');
  ulElement.classList.add('list-group');
  ulElement.classList.add('border-0');
  ulElement.classList.add('rounded-0');
  state.feeds.forEach(({ feedTitle, feedDescription }) => {
    const liElement = document.createElement('li');
    liElement.classList.add('list-group-item-feed');
    const itemTitle = document.createElement('h6');
    itemTitle.textContent = feedTitle;
    const itemDescription = document.createElement('p');
    itemDescription.classList.add('m-0');
    itemDescription.classList.add('small');
    itemDescription.classList.add('text-black-50');
    itemDescription.textContent = feedDescription;
    liElement.append(itemTitle);
    liElement.append(itemDescription);
    ulElement.append(liElement);
  });
  selectors.feedContainer.append(ulElement);
};

const callbackRender = (itemTitle, buttonEl, watchedUiState, modalData) => {
  const { postlink, title, description } = modalData;
  itemTitle.addEventListener('click', (e) => {
    watchedUiState.push(e.target.dataset.id);
  });
  buttonEl.addEventListener('click', (e) => {
    renderModal(title, postlink, description);
    watchedUiState.push(e.target.dataset.id);
  });
};

const postsRender = (state, selectors, watchedUiState, i18nInstance) => {
  selectors.postsContainer.innerHTML = '';
  const postCard = document.createElement('div');
  postCard.classList.add('card-body');
  const postTittle = document.createElement('h3');
  postTittle.textContent = i18nInstance.t('posts');
  postCard.append(postTittle);
  selectors.postsContainer.append(postCard);

  const postUlElement = document.createElement('ul');
  state.posts.forEach(({
    postlink, title, postId, description,
  }) => {
    const liElement = document.createElement('li');
    liElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'border-0', 'border-end-0');
    const itemTitle = document.createElement('a');
    itemTitle.dataset.id = postId;
    itemTitle.setAttribute('href', postlink);
    itemTitle.setAttribute('target', '_blank');
    itemTitle.textContent = title;
    liElement.append(itemTitle);
    const buttonEl = document.createElement('button');
    buttonEl.setAttribute('type', 'button');
    buttonEl.dataset.id = postId;
    buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonEl.dataset.bsToggle = 'modal';
    buttonEl.dataset.bsTarget = '#exampleModal';
    buttonEl.textContent = i18nInstance.t('view');
    liElement.append(buttonEl);
    postUlElement.append(liElement);
    const modalData = {
      postlink, title, postId, description,
    };

    callbackRender(itemTitle, buttonEl, watchedUiState, modalData);
  });
  selectors.postsContainer.append(postUlElement);
};

const uiRender = (uiState) => {
  const anchors = document.querySelectorAll('a');
  anchors.forEach((anchor) => {
    if (uiState.includes(anchor.dataset.id)) {
      anchor.classList.remove('fw-bold');
      anchor.classList.add('fw-normal');
      anchor.classList.add('link-secondary');
    } else {
      anchor.classList.remove('fw-normal');
      anchor.classList.add('fw-bold');
      anchor.classList.remove('link-secondary');
    }
  });
};

export {
  formRender, postsRender, uiRender, renderFeeds,
};
