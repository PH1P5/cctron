

const editTextrea = document.querySelector('.json-editor');
window.cctronIpcApi.injectConfig((event, value) => {
    editTextrea.innerHTML = value;
});

const saveButton = document.querySelector('.save-btn');
saveButton.addEventListener('click', async () => {
    await window.cctronIpcApi.saveConfig(editTextrea.value);
});