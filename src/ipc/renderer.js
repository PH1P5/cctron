

const json = document.getElementById('json')
window.cctronIpcApi.injectConfig((event, value) => {
    json.innerHTML = value;
    event.sender.send('inject-config', value);
});
