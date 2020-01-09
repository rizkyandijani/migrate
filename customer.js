
// const Promise = require('bluebird')

// class CustomerController {
//     static async migrate(req,res,next) {
//         console.log('masuk cust controller')
//         let data = fs.readFileSync('./data/customer.json', 'utf8')
//         // let dataBaru = data.split('\n')
//         let {customers} = JSON.parse(data)
//         let paramsHardCode = {
//             marital_status: "Belum Kawin", 
//             occupation: "Karyawan Swasta", 
//             religion: "Islam",
//             province: "Daerah Khusus Ibukota Jakarta",
//             regency: "Kota Adm. Jakarta Selatan",
//             district: "Kebayoran Baru",
//         }
//         let arrOfComplete = []
//         let arrOfReject = []
//         for(let i = 0 ; i < 500 ; i++){
//             let objectIterasi = customers[i]
//             let newObject = {...objectIterasi, ...paramsHardCode}
//             console.log(newObject, 'cek trial data i', i);
//             await axios.put('https://api.agenkan.com/staging/authentication/borrower/', {
//                         ...newObject
//                 }, { headers: {
//                     type: "CMS",
//                     version: "2.00"
//                 }})
//             .then(async ({data}) => {
//                 let status = [`${customers[i].ktp}`, 'complete']
//                 arrOfComplete.push(status)
//             })
//             .catch(err => {
//                 console.log(err)
//                 let status = [`${customers[i].ktp}`, `${customers[i].phone_number}`, `${err.response.data.message}`]
//                 arrOfReject.push(status)
//             })
//         }
//         console.log(arrOfReject, arrOfComplete.length, 'ini arr complete');
        
//         res.send(arrOfReject)
//     }
// }

// module.exports = CustomerController 

(async () => 
{
    try {
        const fs = require('fs')
        const axios = require('axios')
        const dataPath = './api/data/customer.json'
        const jsonReader = require('jsonfile')
        console.log('masuk cust controller')

        let {customers} = await jsonReader.readFile(dataPath)
        // let dataBaru = data.split('\n')
        // console.log('cek data', data)
        // let {customers} = JSON.parse(data)
        let paramsHardCode = {
                marital_status: "Belum Kawin", 
                occupation: "Karyawan Swasta", 
                religion: "Islam",
                province: "Jawa Tengah",
                regency: "Kabupaten Banyumas",
                district: "Somagede",
            }
        let arrOfComplete = []
        let arrOfReject = []
        let rejectObject = {customers: [], reject: []}
        let output_customer = {}

        for(let i = 0 ; i < customers.length; i++){
            let objectIterasi = customers[i]
            let newObject = {...objectIterasi, ...paramsHardCode}
            // if(validateEmail(newObject.email) === false){
            //     newObject.email = 'default@mail.com'
            // }
            console.log(newObject, 'index data i', i);
            await axios.put('https://api.agenkan.com/staging/authentication/borrower/', {
                        ...newObject
                }, { headers: {
                    type: "CMS",
                    version: "2.00"
                }})
            .then(async ({data}) => {
                let status = [`${customers[i].ktp}`, 'complete']
                arrOfComplete.push(status)
                output_customer[newObject.ktp] = newObject
            })
            .catch(err => {
                let status = [`${customers[i].ktp}`, `${customers[i].phone_number}`, `${err.response.data.message}`]
                arrOfReject.push(status)
                rejectObject.customers.push(customers[i])
            })
        }
        console.log(arrOfComplete, arrOfComplete.length, 'ini arr Complete');
        console.log(arrOfReject, arrOfReject.length, 'ini arr reject');
        rejectObject.reject = arrOfReject
        console.log('ini total data', customers.length)
        let stringify = JSON.stringify(rejectObject)
        fs.writeFileSync('./api/data/customerReject.json', stringify, (err) => {
            if(err){
                throw err
            }
        })
        fs.writeFileSync('./api/data/output-customer.json', JSON.stringify(output_customer), (err) => {
            if(err){
                throw err
            }
        })
    }
    catch(e) {
        console.log('error boss',e)
    }
})()