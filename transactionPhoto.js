(async () => 
{
    try {
        const fs = require('fs')
        const axios = require('axios')
        const dataPath = './api/data/agenKANV1Migration'
        const newDataPath = './api/data/newMigrationTrans'
        const unMigratedPath = './api/data/unmigratedTrans'
        const transactionPath = './api/data/output-transaction.json'
        const jsonReader = require('jsonfile')
        const ncp = require('ncp').ncp
        console.log('masuk transaction photo controller')

        const transactionJSON = await jsonReader.readFile(transactionPath)

        const dataList = fs.readdirSync(dataPath)
        
        for( i = 0 ; i < dataList.length ; i++){
            let oldId = dataList[i]
            console.log('ini iterasi ke ', i, oldId)
            fs.mkdirSync((transactionJSON[oldId] ? newDataPath + '/' + transactionJSON[oldId].transaction_id : unMigratedPath + '/' + dataList[i] ))
            // fs.mkdirSync(newDataPath + '/' + dataList[i] + '/' + (transactionJSON[oldId] ? transactionJSON[oldId].transaction_id : 'no_transaction_data'))
            const listContent = fs.readdirSync(dataPath + '/' + dataList[i])
            const folder = listContent.filter((value) => value.indexOf('.') === -1)
            const oldPath = `${dataPath}/${oldId}`
            const newPath = transactionJSON[oldId] ? `${newDataPath}/${transactionJSON[oldId].transaction_id}` : `${unMigratedPath}/${dataList[i]}`
            folder.forEach(value => {
               const listFile = fs.readdirSync(dataPath+'/'+dataList[i]+'/'+value)
               if(listFile.length !== 0){
                   if(value === 'aksesoris' || value === 'hp' || value === 'penggadai'){
                        listFile.forEach(async name => {
                            let fileName = name
                            // console.log('ini id', oldId,'ini data trans',transactionJSON[oldId])
                            if(name === 'samping_kanan.jpg'){
                                fileName = 'tampak_kanan.jpg'
                            }else if(name === 'samping_kiri.jpg'){
                                fileName = 'tampak_kiri.jpg'
                            }else if( name === 'penggadai_dengan_ktp.jpg'){
                                fileName = 'penggadai.jpg'
                            }
                            let upload = fs.copyFileSync(`${oldPath}/${value}/${name}`,`${newPath}/${fileName}`)
                        })
                   }
               }
            })
            const file =  listContent.filter((value) => value.indexOf('.') !== -1)
            if(file.indexOf('loan_document.pdf') !== -1){
               let upload = fs.copyFileSync(`${oldPath}/loan_document.pdf`, `${newPath}/loan_document.pdf`)
            }

            if(file.indexOf('bukti_transfer.jpg') !== -1){
                let path = transactionJSON[oldId] ? newDataPath + '/' + 'sudah_ditebus_dan_ditransfer' + '/' + transactionJSON[oldId].id : unMigratedPath + '/' + 'sudah_ditebus_dan_ditransfer' + '/' + dataList[i]
                fs.mkdirSync(path)
                let upload1 = fs.copyFileSync(`${oldPath}/bukti_transfer.jpg`, `${path}/foto_bukti_transfer.jpg`)
            }

            if(file.indexOf('bukti_transfer_gadai.jpg') !== -1){
                let path = transactionJSON[oldId] ? newDataPath + '/' + 'approve' + '/' + transactionJSON[oldId].id : unMigratedPath + '/' + 'approve' + '/' + dataList[i]
                fs.mkdirSync(path)
                let upload2 = fs.copyFileSync(`${oldPath}/bukti_transfer_gadai.jpg`, `${path}/bukti_transfer.jpg`)
            }

            if(file.indexOf('penebusan_penggadai.jpg') !== -1){
                let path = transactionJSON[oldId] ? newDataPath + '/' + 'sudah_ditebus' + '/' + transactionJSON[oldId].id : unMigratedPath + '/' + 'sudah_ditebus' + '/' + dataList[i]
                fs.mkdirSync(path)
                let upload3 = fs.copyFileSync(`${oldPath}/penebusan_penggadai.jpg`, `${path}/foto_penggadai.jpg`)
            }



            // console.log('ini folder', folder, 'ini file', file)
        }
        // const dataPertama = fs.readdirSync(dataPath + '/' + dataList[0])
        // ncp(`${dataPath}/${dataList[0]}`,`${newDataPath}/${dataList[1]}`, (err) => {
        //     if(err){
        //         throw err
        //     }
        //     console.log('done copy!')
        // })
        // console.log(dataPertama);
        console.log('ini banyak data',dataList.length);
    }
    catch(e) {
        console.log('error boss',e)
    }
})()