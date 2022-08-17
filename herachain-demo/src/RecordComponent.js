import { Record } from './App.js';
import { ethers } from 'ethers'
import Caver from 'caver-js'
import App from './App.js'
import { create, get } from 'ipfs-http-client'
import { useState, useRef, useEffect } from 'react' // new
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { AccountContext } from './context';
import { databaseAddress, ownerAddress } from './config'
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import EMRContractDatabase from './artifacts/contracts/EMRContractDatabase.sol/EMRContractDatabase.json'
import EMRStorageContract from './artifacts/contracts/EMRStorageContract.sol/EMRStorageContract.json'

import { Interface } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import AccordionItem from 'react-bootstrap/esm/AccordionItem.js';


const BAOBAB_TESTNET_RPC_URL = 'https://api.baobab.klaytn.net:8651/'
const caver = new Caver(BAOBAB_TESTNET_RPC_URL)

export default function RecordComponent(props) {
    const [recordDate, setRecordDate] = useState()
    const [recordType, setRecordType] = useState()
    const [recordDescription, setRecordDescription] = useState()
    const [recordImage, setRecordImage] = useState()
    const recordId = props.id
    const recordNum = props.num
    const ipfsURI = 'https://heradigitalhealth.infura-ipfs.io/ipfs'



    useEffect(() => {
        setRecordDate(convertToDate(props.date))
        setRecordType(props.type)
        getStaticProps()
    }, [])


    function convertToDate(string) {
        const t = parseInt(string)
        const milliseconds = t * 1000
        const dateObject = new Date(milliseconds)
        const dateTimestamp = dateObject.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        // console.log(dateTimestamp)
        return dateTimestamp
    }

    async function getStaticProps() {
        const dataUrl = `${ipfsURI}/${props.data_hash}`
        const response = await fetch(dataUrl)
        const data = await response.json()
        setRecordDescription(data)

        const imageUrl = `${ipfsURI}/${props.image_hash}`
        console.log(imageUrl)
        setRecordImage(imageUrl)
    }

    async function removeRecord() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const databaseContract = new ethers.Contract(databaseAddress, EMRContractDatabase.abi, signer)
        let emrStorageAddress = await databaseContract.getEMRStorageContract()
        const storageContract = new ethers.Contract(emrStorageAddress, EMRStorageContract.abi, signer);
        await storageContract.voidEMR(recordId)
    }

    return (
        <tr>
            <th scope="row" name="num">{recordNum}</th>
            <td name="date">{recordDate}</td>
            <td name="type"> {recordType} </td>
            <td name="description">{recordDescription}</td>
            <td>
                <div>
                    <Accordion defaultActiveKey="1">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>View Record</Accordion.Header>
                            <Accordion.Body>
                                <img className="recordImage" src={recordImage} />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </td >
            <td>
                <Button className="removeRecord" onClick={removeRecord}>X</Button>
            </td>
        </tr >

    )
}