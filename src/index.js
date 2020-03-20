import React from 'react';
import {render, hydrate} from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
// import ReactDOMServer from 'react-dom/server';
import './index.css';
import App from './App';
// import * as serviceWorker from './serviceWorker';

const main = document.getElementById('main');

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
,
main,
()=>{
  console.log('render');
});


// console.log(ReactDOMServer.renderToString(<App />));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
// serviceWorker.register();
