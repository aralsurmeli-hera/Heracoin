import React from 'react';
import { ImagePicker } from 'react-file-picker';
import './App.css';
import { useState } from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
//import EMRContractDatabase from '../artifacts/contracts/EMRContractDatabase/EMRContractDatabase.json'

{/* <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous"> */ }


function App() {
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState("");


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
    } catch (err) {
      console.log('error:', err)
    }
  }



  return (

    <div className="container">
      <center><img className="logo mt-40" src={require("./img/logo-hera.png")} /><br />
        <h2 className="hera-purple">Hera Digital Documentation System</h2>
      </center>

      <center><img className="mt-20 mr-20" src={require('./img/logo-metamask.png')} /><button className="btn metamask-btn mt-20" onClick={connect} >Connect Metamask Wallet</button></center>


      <div className="mt-20 col-md-6 col-sm-12 margin-zero">

        <h4 className="form-label hera-purple">Upload a file</h4>

        <FileForm />

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


    </div>


  );
}

class FileForm extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {

    return (
      <form>
        <input className="form-control mt-20" type="file" />

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

    );
  }
}

export default App;
