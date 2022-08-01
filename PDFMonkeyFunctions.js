import axios from 'axios';
import { createWriteStream, unlinkSync } from 'fs';
import { promisify } from 'util';
import * as stream from 'stream';
const finished = promisify(stream.finished);
import 'dotenv/config'

export async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

const PDFMonkeyPublishRequest = {
    document: {
    status: 'pending',
    },
};

const PDFMonkeyHeaderInfo = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PDFMONKEY_BEARER}`,
      },
  };

export const downloadPDF = (documentID) => {
    return axios.put(`https://api.pdfmonkey.io/api/v1/documents/${documentID}`, PDFMonkeyPublishRequest, PDFMonkeyHeaderInfo)
}

export const getPDF = (documentID) => {
    return axios.get(`https://api.pdfmonkey.io/api/v1/documents/${documentID}`, PDFMonkeyHeaderInfo)
}

export const downloadFile = async (url, targetFile) => {  
    const writer = createWriteStream(targetFile);
    return axios.get(url, {responseType: 'stream'})
        .then(res => {
            res.data.pipe(writer)
            return finished(writer)
        })
};

export const deleteFile = async (targetFile) => {  
    unlinkSync(targetFile)
};