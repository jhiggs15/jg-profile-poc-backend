import express from 'express';
import { Storage } from '@google-cloud/storage';
import { deleteFile, downloadFile, downloadPDF, getPDF, sleep } from './PDFMonkeyFunctions.js';
import { cloudFileUpload } from './CloudFunctions.js';
import 'dotenv/config'

const app = express()
const port = 3001
const storage = new Storage({keyFilename: 'key.json'});

app.get('/download/:documentID', async (req, res) => {
    const {documentID} = req.params
    try{
        const updateTime = new Date();
        let pdfResult = await downloadPDF(documentID)
        let generationLogs = pdfResult.data.document.generation_logs
        if(generationLogs.length === 0) {
            res.status(500).send("Generation log is empty")
            return
        }
        let lastGenerationLog = generationLogs.at(-1);

        while(updateTime > new Date(lastGenerationLog.timestamp)) {
            if(lastGenerationLog.type === "error") {
                res.status(500).send("Generation Log type is error")
                return
            }
            await sleep(2000);
            pdfResult = await getPDF(documentID)
            lastGenerationLog = pdfResult.data.document.generation_logs.at(-1);
        }
        let pdfMonkeyDownloadURL = pdfResult.data.document.download_url
        let pdfMonkeyFileName = pdfResult.data.document.filename
        let pdfMonkeyFileLocation = `./pdfDownloads/${pdfMonkeyFileName}`
        await downloadFile(pdfMonkeyDownloadURL, pdfMonkeyFileLocation)
        const result = await cloudFileUpload(storage, "profile-poc", pdfMonkeyFileLocation, pdfMonkeyFileName)
        await deleteFile(pdfMonkeyFileLocation)
        // or can use self link
        res.send(result[0].metadata.mediaLink)
    }
    catch(error) {
        console.error(error)
        res.status(500).json(error)
    }

})


app.get('/', (req, res) => {
    res.send("Hello World")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})