(async () => {
    try {
        const fs = require('fs')
        const dataPath = './api/data/output-customer.json'
        const jsonReader = require('jsonfile')
        console.log('masuk create id data')


        let data = await jsonReader.readFile(dataPath)
        let arrayKey = Object.keys(data)
        let firebaseKtp = {}
        arrayKey.forEach((val) => {
            const {id} = data[val]
            firebaseKtp[id] = val
        })
        // console.log(firebaseKtp)
        fs.writeFileSync('./api/data/output-firebaseKtp.json',JSON.stringify(firebaseKtp), (err) => {
            if(err){
                throw err
            }
        })
        // console.log('ini data',Object.keys(data), 'ini length', Object.keys(data).length )
        
    }
    catch(e) {
        console.log(e)
    }
})()