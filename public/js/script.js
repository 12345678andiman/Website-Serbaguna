const socket = io();

const form = document.querySelector('#search');
const select = document.querySelector('#select');
const keyword = document.querySelector('#keyword');

const result = document.querySelector('#result');

form.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit(select.value, keyword.value);
    keyword.value = '';
});

socket.on('result', r => {
    result.innerHTML = r;
});