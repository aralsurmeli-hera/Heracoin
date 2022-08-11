import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { ethers } from 'ethers'
import Caver from 'caver-js'
import { KaikasWeb3Provider } from "@klaytn/kaikas-web3-provider"
import { create } from 'ipfs-http-client'
import React, { useState, useRef, useEffect, useContext } from 'react' // new
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { AccountContext } from './context';
// import emr from './emr.js'
import {
  databaseAddress, ownerAddress
} from './config'

import heralogo from './img/logo-hera.png'
import metamasklogo from './img/logo-metamask.png'

import EMRContractDatabase from './artifacts/contracts/EMRContractDatabase.sol/EMRContractDatabase.json'
import EMRStorageContract from './artifacts/contracts/EMRStorageContract.sol/EMRStorageContract.json'

import { Interface } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { toHaveStyle } from '@testing-library/jest-dom/dist/matchers';
import RecordComponent from './RecordComponent';

// const ROPSTEN_TESTNET_RPC_URL = 'https://ropsten.infura.io/'
const BAOBAB_TESTNET_RPC_URL = 'https://api.baobab.klaytn.net:8651/'

// const rpcURL = ROPSTEN_TESTNET_RPC_URL
const rpcURL = BAOBAB_TESTNET_RPC_URL

// const web3 = new Web3(rpcURL)
const caver = new Caver(rpcURL)

//IPFS endpoint
const client = create('https://ipfs.infura.io:5001/api/v0')

const databaseContract = new caver.klay.Contract(EMRContractDatabase.abi, databaseAddress)

//Initial Empty State of Medical Record
const initialState = { description: '', recordType: '', recordDate: '' }

export class Record {
  constructor(id, type, date, image_hash, data_hash) {
    this.id = id;
    this.type = type;
    this.date = date;
    this.image_hash = image_hash;
    this.data_hash = data_hash;
  }
}

function App({ Component, pageProps }) {
  const [account, setAccount] = useState(null)
  const [file, setFile] = useState(null)
  const [record, setRecord] = useState(initialState)
  const { description, recordType, recordDate } = record
  const [ownedRecords, setOwnedRecords] = useState([])
  let rows = []
  const [provider, setProvider] = useState(null)

  const fileRef = useRef(null)

  const [loaded, setLoaded] = useState(false)

  // const { records } = pageProps

  function onChange(e) {
    setRecord(() => ({ ...record, [e.target.name]: e.target.value }))
  }

  useEffect(() => {
    setTimeout(() => {
      /* delay rendering buttons until dynamic import is complete */
      setLoaded(true)
    }, 500)
  }, [])

  async function getWeb3Modal() {
    const web3Modal = new Web3Modal({
      cacheProvider: false,
      network: "boabab",
      networkId: 1001,
      chain: "Klaytn",
      chainId: 1001,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "your-infura-id"
          },
          kaikas: {
            package: KaikasWeb3Provider,
          }
        },
      },
    })
    console.log(web3Modal)
    return web3Modal
  }



  /* the connect function uses web3 modal to connect to the user's wallet */
  async function connect() {
    try {
      const web3Modal = await getWeb3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const accounts = await provider.listAccounts()
      caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(provider.getSigner()))
      console.log(accounts)
      setAccount(accounts[0])
      console.log(account)
      console.log(provider)
      setProvider(provider)
      console.log(caver.klay.accounts)
      getOwnedRecords()
    } catch (err) {
      console.log('error:', err)
    }
  }



  async function saveImageToIpfs() {
    /* save post metadata to ipfs */
    try {
      const added = await client.add(file)
      return added.path
    } catch (err) {
      console.log('Could not upload image: ', err)
    }
  }

  async function saveDataToIpfs() {
    /* save post metadata to ipfs */
    try {
      const added = await client.add(JSON.stringify(record.description))
      return added.path
    } catch (err) {
      console.log('Could not upload Data: ', err)
    }
  }

  const convertToUnix = (date) => {
    const dateFormat = new Date(date);
    let unixTimestamp = Math.floor(dateFormat.getTime() / 1000)
    // console.log(unixTimestamp)
    return unixTimestamp
  }


  async function createNewRecord(e) {
    /* saves post to ipfs then anchors to smart contract */
    if (file == null) {
      alert("Please upload a Medical Record Image to add to HeraChain")
      return
    }
    if (!recordType) {
      alert("Please select a valid Record Type.")
      return
    }
    if (!recordDate) {
      alert("Please provide a valid Record Date")
      return
    }
    const unix = convertToUnix(recordDate)

    if (isNaN(unix)) {
      alert("Please provide a valid Record Date")
      return
    }

    const image_hash = await saveImageToIpfs()
    console.log("Image has been saved to " + image_hash)
    const data_hash = await saveDataToIpfs()
    console.log("Data has been saved to " + data_hash)
    var success = await createEMR(image_hash, data_hash)
    if (!success) {
      alert("Unable to create an EMR on the blockchain. Please check that you have connected your wallet.")
      return
    }
    alert("Medical Record Successfully Added to HeraChain")
    setRecord(() => ({ description: '', recordType: '', recordDate: '' }))
    document.getElementById("form").reset();
    setFile(null)
  }



  async function createEMR(image_hash, data_hash) {
    if (typeof window.ethereum !== 'undefined') {
      const signer = provider.getSigner()
      console.log(signer)
      console.log('contract: ', databaseAddress)
      console.log('signer: ', account)
      try {
        const unixdate = convertToUnix(record.recordDate)
        console.log("Record Date: " + unixdate)
        const val = await databaseContract.methods.createEMR(record.recordType, "Active", unixdate, image_hash, data_hash).send({
          from: ownerAddress,
          feePayer: ownerAddress,
          feeDelegation: true,
          gas: 300000000,
        })

        console.log('val: ', val)
        return true;
      } catch (err) {
        console.log('Error: ', err)
        return false;
      }
    }
    return false;

  }

  function onFormChange(e) {
    setRecord(() => ({ ...record, [e.target.name]: e.target.value }))
    console.log(record)
  }

  async function getOwnedRecords() {
    console.log("Getting owned EMRs")
    console.log("Database: " + databaseContract.options.address)
    setOwnedRecords([])
    const web3Modal = await getWeb3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    console.log(provider)
    // const signer = new caver.account(provider.getSigner())
    const signer = provider.getSigner()
    // const databaseContract = new ethers.Contract(databaseAddress, EMRContractDatabase.abi, signer)
    await databaseContract.methods.createEMRStorage().send({
      from: ownerAddress,
      // feePayer: ownerAddress,
      // feeDelegation: true,
      gas: 300000000,
    })

    let emrStorageAddress = await databaseContract.methods.getEMRStorageContract().call()
    console.log("Storage: " + emrStorageAddress)

    const storageContract = new caver.contract(EMRStorageContract.abi, emrStorageAddress);
    let ownedRecs = await storageContract.methods.getEMRIDs()
    for (let j = 0; j < ownedRecs.length; j++) {
      var rec = ownedRecs[j];
      let emr: Record = {
        id: j + 1,
        type: rec.record_type,
        date: rec.record_date,
        image_hash: rec.ipfs_image_hash,
        data_hash: rec.ipfs_data_hash
      }
      setOwnedRecords(ownedRecords => [...ownedRecords, emr]);
    }
    console.log(ownedRecords)
  }

  const afterSubmission = (event) => {
    event.preventDefault();
    // setRecord(() => ({ description: '', recordType: '', recordDate: '' }))
    // document.getElementById("form").reset();
    // setFile(null)
  }

  useEffect(() => {
    async function fetchEMRs() {
      await getOwnedRecords()
    }
  }, [])


  return (
    <><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous" /><div className="container">
      <center><img className="logo mt-40" src={heralogo} alt="hera logo" /><br />
        <h2 className="hera-purple">Hera Digital Documentation System</h2>
      </center>

      <center><img className="mt-20 mr-20" src={metamasklogo} alt="metamask logo" /><button className="metamask-btn mt-20" onClick={connect}>Connect Metamask Wallet</button></center>
      <center><h6 className="address-display">Account: {account}</h6></center>

      <div className="mt-20 col-md-6 col-sm-12 margin-zero">

        <h4 className="form-label hera-purple">Upload a file</h4>

        {/* <FileForm onSubmit={createEMR} /> */}
        <form id="form" onSubmit={afterSubmission}>
          <input className="form-control mt-20" type="file" onChange={(e) => setFile(e.target.files[0])} />

          <label className="form-label mt-20">Description</label>
          <textarea name='description' className="form-control" rows="3" onChange={onFormChange} />

          <label className="form-label mt-20">Record Type</label>
          <select className="form-select" name='recordType' onChange={onFormChange}>
            <option selected value="" >Record Type</option>
            <option value="Personal ID">Personal ID</option>
            <option value="Health Report">Health Report</option>
            <option value="Vaccination Report">Vaccination Report</option>
          </select>

          <label className="form-label mt-20">Record Date (MM/DD/YYYY)</label>

          <input className="form-control" name='recordDate' type="text" onChange={onFormChange} />

          <button type="submit" className="btn btn-primary mt-20" onClick={createNewRecord}>Submit</button>
        </form>

      </div>

      <div className="mt-40 col-md-12">
        <h2 className="hera-purple">Saved Records</h2>

        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Record Date</th>
              <th scope="col">Record Type</th>
              <th scope="col">Description</th>
              <th scope="col">Uploaded File</th>
            </tr>
          </thead>
          <tbody>
            {ownedRecords.map(function (record, i) {
              return <RecordComponent {...record} record={record} key={i}></RecordComponent>;
            })}
            {/* <tr>
              <th scope="row">1</th>
              <td>22/12/2020</td>
              <td>Health Report</td>
              <td>Blood Test where my sugar levels were too high. Oh noooo... :(</td>
              <td>
                <div className="accordion" id="accordionExample">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapseOne">
                        View File
                      </button>
                    </h2>
                    <div id="collapse1" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                      <div className="accordion-body">
                        <img src={require('./img/medicalreport.png')} />
                      </div>
                    </div>
                  </div>
                </div>


              </td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>2/01/2022</td>
              <td>Personal ID</td>
              <td>For my own safekeeping. My ID in my home country</td>
              <td>
                <div className="accordion" id="accordionExample">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="true" aria-controls="collapseOne">
                        View File
                      </button>
                    </h2>
                    <div id="collapse2" className="accordion-collapse collapse" aria-labelledby="heading1" data-bs-parent="#accordionExample">
                      <div className="accordion-body">
                        <img src={require('./img/medicalreport.png')} />
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td>5/02/2022</td>
              <td>Personal ID</td>
              <td>My driver's licensein my home country</td>
              <td>
                <div className="accordion" id="accordionExample">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="true" aria-controls="collapseOne">
                        View File
                      </button>
                    </h2>
                    <div id="collapse3" className="accordion-collapse collapse" aria-labelledby="heading3" data-bs-parent="#accordionExample">
                      <div className="accordion-body">
                        <img src={require('./img/medicalreport.png')} />
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr> */}
          </tbody>


        </table>

      </div>


      <div class="mt-40"></div>


    </div></>


  );
}

export default App;
