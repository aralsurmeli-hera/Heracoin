import './App.css';
import { ethers } from 'ethers'
import { create } from 'ipfs-http-client'
import { useState, useRef, useEffect } from 'react' // new
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { AccountContext } from './context';
// import emrdatabase from './emrdatabase.js'
// import emr from './emr.js'
import {
  databaseAddress, ownerAddress
} from './config'

import EMRContractDatabase from './artifacts/contracts/EMRContractDatabase.sol/EMRContractDatabase.json'

//IPFS endpoint
const client = create('https://ipfs.infura.io:5001/api/v0')

//Initial Empty State of Medical Record
const initialState = { description: '', recordType: '', recordDate: '' }

function App({ Component, pageProps }) {
  const [account, setAccount] = useState(null)
  const [file, setFile] = useState(null)
  const [record, setRecord] = useState(initialState)
  const { description, recordType, recordDate } = record

  // const router = useRouter()
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
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "your-infura-id"
          },
        },
      },
    })
    return web3Modal
  }

  /* the connect function uses web3 modal to connect to the user's wallet */
  async function connect() {
    try {
      const web3Modal = await getWeb3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const accounts = await provider.listAccounts()
      setAccount(accounts[0])
      console.log(provider)
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
      console.log('error: ', err)
    }
  }

  async function saveDataToIpfs() {
    /* save post metadata to ipfs */
    try {
      const added = await client.add(JSON.stringify(record.description))
      return added.path
    } catch (err) {
      console.log('error: ', err)
    }
  }

  const convertToUnix = (date) => {
    const dateFormat = new Date(date);
    let unixTimestamp = Math.floor(date.getTime() / 1000)
    // console.log(unixTimestamp)
    return unixTimestamp
  }


  async function createNewRecord() {
    /* saves post to ipfs then anchors to smart contract */
    if (!recordType || !recordDate) return
    const image_hash = await saveImageToIpfs()
    console.log(image_hash)
    console.log(data_hash)
    const data_hash = await saveDataToIpfs()
    await createEMR(image_hash, data_hash)
    // router.push(`/`)
  }



  async function createEMR(image_hash, data_hash) {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      console.log(signer)
      const contract = new ethers.Contract(databaseAddress, EMRContractDatabase.abi, signer)
      console.log('contract: ', contract)
      try {
        const unixdate = convertToUnix(record.recordDate)
        const val = await contract.createEMR(record.recordType, "Active", unixdate, image_hash, data_hash)
        /* optional - wait for transaction to be confirmed before rerouting */
        /* await provider.waitForTransaction(val.hash) */
        console.log('val: ', val)
      } catch (err) {
        console.log('Error: ', err)
      }
    }

  }



  return (
    <><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous" /><div className="container">
      <center><img className="logo mt-40" src={require("./img/logo-hera.png")} alt="hera logo" /><br />
        <h2 className="hera-purple">Hera Digital Documentation System</h2>
      </center>

      <center><img className="mt-20 mr-20" src={require('./img/logo-metamask.png')} alt="metamask logo" /><button className="btn metamask-btn mt-20" onClick={connect}>Connect Metamask Wallet</button></center>
      <center><h6 className="address-display">{account}</h6></center>

      <div className="mt-20 col-md-6 col-sm-12 margin-zero">

        <h4 className="form-label hera-purple">Upload a file</h4>

        {/* <FileForm onSubmit={createEMR} /> */}
        <form onSubmit={createNewRecord}>
          <input className="form-control mt-20" type="file" onChange={(e) => setFile(e.target.files[0])} />

          <label className="form-label mt-20">Description</label>
          <textarea className="form-control" rows="3" />

          <label className="form-label mt-20">Record Type</label>
          <select className="form-select">
            <option selected>Record Type</option>
            <option value="1">Personal ID</option>
            <option value="2">Health Report</option>
            <option value="3">Vaccination Report</option>
          </select>

          <label className="form-label mt-20">Record Date (MM/DD/YYYY)</label>

          <input className="form-control" type="text" />

          <button type="submit" className="btn btn-primary mt-20">Submit</button>
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
            <tr>
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
            </tr>
          </tbody>


        </table>

      </div>


      <div class="mt-40"></div>


    </div></>


  );
}

// class FileForm extends React.Component {
//   constructor(props) {
//     super(props);
//   }

//   render() {
//     const [file, setFile] = useState("");



//     return (

//       <form onSubmit={createEMR}>
//         <input className="form-control mt-20" type="file" value={file} onChange={(e) => selectedFile(e.target.files[0])} />

//         <label className="form-label mt-20">Description</label>
//         <textarea className="form-control" rows="3" />

//         <label className="form-label mt-20">Record Type</label>
//         <select className="form-select">
//           <option selected>Record Type</option>
//           <option value="1">Personal ID</option>
//           <option value="2">Health Report</option>
//           <option value="3">Vaccination Report</option>
//         </select>

//         <label className="form-label mt-20">Record Date (MM/DD/YYYY)</label>

//         <input className="form-control" type="text" />

//         <button type="submit" className="btn btn-primary mt-20">Submit</button>
//       </form>

//     );
//   }
// }

export default App;
