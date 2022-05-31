import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { useContext } from 'react';
// import { useRouter } from 'next/router';
// import { AccountContext } from './context';
// import { ethers } from 'ethers'

// import {
//   databaseAddress, ownerAddress
// } from './config'

// import EMRContractDatabase from './artifacts/contracts/EMRContractDatabase.sol/EMRContractDatabase.json'
// import EMRContract from './artifacts/contracts/EMRContract.sol/EMRContract.json'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
