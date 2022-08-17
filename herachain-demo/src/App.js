import './App.css';
import { ethers } from 'ethers'
import Caver from 'caver-js'
import { create as ipfsHttpClient } from 'ipfs-http-client'

import React, { useState, useRef, useEffect, useContext } from 'react'
import 'bootstrap/dist/css/bootstrap.css';


import { KaikasWeb3Provider } from "@klaytn/kaikas-web3-provider"

import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { AccountContext } from './context';
import { databaseAddress, ownerAddress } from './config'

import heralogo from './img/logo-hera.png'
import metamasklogo from './img/logo-metamask.png'

import EMRContractDatabase from './artifacts/contracts/EMRContractDatabase.sol/EMRContractDatabase.json'
import EMRStorageContract from './artifacts/contracts/EMRStorageContract.sol/EMRStorageContract.json'

import { Interface } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import RecordComponent from './RecordComponent';


const BAOBAB_TESTNET_RPC_URL = 'https://api.baobab.klaytn.net:8651/'
const caver = new Caver(BAOBAB_TESTNET_RPC_URL)


//IPFS endpoint
const projectId = '2DBkdZ0RLVleEQgaqcR5VNoaO4d'
const projectSecret = 'aebbd2d6d63d774c249c32d27c2bb4c4'
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

//Initial Empty State of Medical Record
const initialState = { description: '', recordType: '', recordDate: '' }

export class Record {
    constructor(num, id, type, date, image_hash, data_hash) {
        this.num = num;
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
    const [provider, setProvider] = useState(null)
    const [loaded, setLoaded] = useState(false)

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
        return web3Modal
    }

    async function checkForBoabab() {
        const provider = window.ethereum;
        if (!provider) {
            console.log("Metamask is not installed, please install!");
            return
        }
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x3E9' }],
            });
            console.log("You have succefully switched to Boabab Test network")
            return
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                console.log("This network is not available in your metamask, please add it")
            }
            console.log("Failed to switch to the network")
        }
        try {
            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: '0x3E9',
                        chainName: 'boabab',
                        rpcUrls: [BAOBAB_TESTNET_RPC_URL],
                        nativeCurrency: { symbol: 'KLAY', decimals: 18 }
                    }]
            });
        }
        catch (addError) {
            console.log(addError);
        }
    }

    /* the connect function uses web3 modal to connect to the user's wallet */
    async function connect() {
        try {
            await checkForBoabab()
            const web3Modal = await getWeb3Modal()
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)
            const accounts = await provider.listAccounts()
            setAccount(accounts[0])
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
        if (image_hash == undefined) {
            alert("Unable to upload files. Please check your IPFS connection.")
            return
        }
        var success = await createEMR(image_hash, data_hash)
        if (!success) {
            alert("Unable to create an EMR on the blockchain. Please check that you have connected your wallet.")
            return
        }
        alert("Medical Record Successfully Added to HeraChain")
        setRecord(() => ({ description: '', recordType: '', recordDate: '' }))
        document.getElementById("form").reset();
        setFile(null)
        await getOwnedRecords()
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
                console.log("Record Date: " + unixdate)
                const val = await contract.createEMR(record.recordType, "Active", unixdate, image_hash, data_hash)
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
    }

    const getOwnedRecords = async () => {
        console.log("Getting owned EMRs")
        setOwnedRecords([])
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const databaseContract = new ethers.Contract(databaseAddress, EMRContractDatabase.abi, signer)
        let emrStorageAddress = await databaseContract.getEMRStorageContract()
        console.log("Storage: " + emrStorageAddress)
        const storageContract = new ethers.Contract(emrStorageAddress, EMRStorageContract.abi, signer);
        let ownedRecs = await storageContract.getEMRIDs()
        for (let j = 0; j < ownedRecs.length; j++) {
            var rec = await storageContract.getEMR(ownedRecs[j])
            let emr: Record = {
                num: j + 1,
                id: ownedRecs[j],
                type: rec.record_type,
                date: rec.record_date,
                image_hash: rec.ipfs_image_hash,
                data_hash: rec.ipfs_data_hash
            }
            setOwnedRecords(ownedRecords => [...ownedRecords, emr]);
        }
        console.log(ownedRecords)
    }

    const afterSubmission = async (event) => {
        event.preventDefault();

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
                        {ownedRecords.map(function (record, key) {
                            return <RecordComponent key={key} id={record.id} num={record.num} type={record.type} image_hash={record.image_hash} data_hash={record.data_hash} date={record.date} refresh={getOwnedRecords}></RecordComponent>
                        })}
                        { }
                    </tbody>
                </table>
            </div>
            <div class="mt-40"></div>
        </div></>
    );
}

export default App;