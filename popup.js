// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const submitForm = document.getElementById('submitForm');
const contactList = document.getElementById('contactList');

submitForm.onsubmit = (event) => {
  chrome.storage.sync.set({ contacts: contactList.value }, () =>
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.executeScript(
        tabs[0].id,
        { file: 'bootstrap.js' });
    }));
};
