import { Record } from './App.js';
import { ethers } from 'ethers'
import caver from 'klaytn/caver'
import { create, get } from 'ipfs-http-client'
import { useState, useRef, useEffect } from 'react' // new
// import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { AccountContext } from './context';
// import emr from './emr.js'
import {
    databaseAddress, ownerAddress
} from './config'
import 'bootstrap/dist/css/bootstrap.css';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import EMRContractDatabase from './artifacts/contracts/EMRContractDatabase.sol/EMRContractDatabase.json'
import EMRContract from './artifacts/contracts/EMRContract.sol/EMRContract.json'

import { Interface } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import AccordionItem from 'react-bootstrap/esm/AccordionItem.js';

export default function RecordComponent(props) {
    const [recordDate, setRecordDate] = useState()
    const [recordType, setRecordType] = useState()
    const [recordDescription, setRecordDescription] = useState()
    const [recordImage, setRecordImage] = useState()
    const recordId = props.id
    const ipfsURI = 'https://ipfs.io/ipfs/'



    useEffect(() => {
        console.log("Converting Date")
        console.log(props.date)
        console.log(props.type)
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
        setRecordImage(imageUrl)

    }

    return (
        <tr>
            <th scope="row" name="id">{recordId}</th>
            <td name="date">{recordDate}</td>
            <td name="type"> {recordType} </td>
            <td name="description">{recordDescription}</td>
            <td>
                <div>
                    <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>View Record</Accordion.Header>
                            <Accordion.Body>
                                <img className="recordImage" src={recordImage} />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
                {/* <div className="accordion" id="accordionExample">
                    <div className="accordion-item">
                        <h2 className="accordion-header" id="headingOne">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapseOne">
                                View File
                            </button>
                        </h2>
                        <div id="collapse1" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                            <div className="accordion-body">
                                <img className="recordImage" src={recordImage} />
                            </div>
                        </div>
                    </div >
                </div > */}
            </td >
        </tr >

    )
}