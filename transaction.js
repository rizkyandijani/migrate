(async () => 
{
    try {
        const fs = require('fs')
        const axios = require('axios')
        const dataPath = './api/data/transactions.json'
        const agenPath = './api/data/output-agen.json'
        const customerPath = './api/data/output-customer.json'
        const outputTransPath = './api/data/output-transaction.json'
        const progressPhotoPath = './api/data/newMigrationTrans'

        const jsonReader = require('jsonfile')
        const Promise = require('bluebird')
        const moment = require('moment')
        const RandomString = require('randomstring')
        const {areaJSON} = require('./area')
        console.log('masuk cust controller')
        // let data = await csvReader().fromFile(dataPath)
        let data = await jsonReader.readFile(dataPath)
        let agenJSON = await jsonReader.readFile(agenPath)
        let customerJSON = await jsonReader.readFile(customerPath)
        let outputTransJSON = await jsonReader.readFile(outputTransPath)
        let platform_rate = null

        function getGeneralForm() {
            return axios.get('https://api.agenkan.com/staging/settings/general/', { headers: {
                type: "CMS",
                version: "2.00",
                Authorization: `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImtiNG81ZGU3eWVnamdsZ3lqcW9vNXpxMjhqODMxayIsInBlcm1pc3Npb25zIjpbIkFETUlOIiwiQUdFTl9BUFBST1ZBTCIsIkFHRU5fQ0hFQ0tFUiIsIkFHRU5fTUFLRVIiLCJBUkVBX0NIRUNLRVIiLCJBUkVBX01BS0VSIiwiQkFOS19DSEVDS0VSIiwiQkFOS19NQUtFUiIsIkNBTlZBU1NFUl9DSEVDS0VSIiwiQ1VTVE9NRVIiLCJDQU5WQVNTRVJfTUFLRVIiLCJHRU5FUkFMX0NIRUNLRVIiLCJHRU5FUkFMX01BS0VSIiwiSEFSR0FfQ0hFQ0tFUiIsIkhBUkdBX01BS0VSIiwiSE9MSURBWV9DSEVDS0VSIiwiSE9MSURBWV9NQUtFUiIsIklOVEVSRVNUX0NIRUNLRVIiLCJJTlRFUkVTVF9NQUtFUiIsIk1TQV9DSEVDS0VSIiwiTVNBX01BS0VSIiwiUEFSVElDSVBBVElPTl9DSEVDS0VSIiwiUEFSVElDSVBBVElPTl9NQUtFUiIsIlFVRVNUSU9OX0NIRUNLRVIiLCJRVUVTVElPTl9NQUtFUiIsIlJFQVNPTiIsIlJFTEFUSU9OU0hJUF9DSEVDS0VSIiwiUkVMQVRJT05TSElQX01BS0VSIiwiU0FMRVNfQ0hFQ0tFUiIsIlNBTEVTX01BS0VSIiwiU0VUVElOR19DSEVDS0VSIiwiU0VUVElOR19NQUtFUiIsIlRJRVJTIiwiVFJBTlNBQ1RJT05fQ0hFQ0tFUiIsIlRSQU5TQUNUSU9OX01BS0VSIl0sImlhdCI6MTU3MTcxODg5NX0.yz7PBlbkzHSFzKiWbr3x7yqmcrdXLw7nrvkA5J1pmpF3MWObBiV0Zg1-SE9RQZD4uiDu1StdulfbwQ4KnP7ApQ`
            }})
            .then(({data}) => {
                // console.log('ini dataaa',data.payload.rows[0])
                platform_rate = data.payload.rows[0].platform_cost
            })
            .catch(err => {
                console.log(err)
            })
        }

        function compileData(params) {
            const {id, uid, hp_type, hp_imei, hp_condition, customer_ktp, customer_name, customer_phone, customer_address, customer_birthdate, customer_reason,
            email, social_medias, relative_name, relative_phone, relative_address, relative_relationship, loan_deal, loan_duration, loan_interest, loan_maximum, loan_payback,
            loan_start, loan_finish, store_comission, store_jastip, store_participation, store_participation_value, admin, store_admin, insurance, state,
            app_name, app_version_code, app_version_name, device_type, device_brand, device_manufacturer, device_model, device_os_sdk, device_os_sdk_name, device_product,
            create_at, update_at
            } = params

            const id_unique = RandomString.generate({
                length: 30,
                charset: "0123456789abcdefghijklmnopqrstuvwxyz"
            })

            const trans_id = (id) => {
                const date = id.substr(0, 8)
                const area_id = areaJSON[id.substr(8, 2)]
                const store_id = id.substr(10, 3)
                const increment = parseInt(id.substr(13, id.length)).toString().padStart(3, '0')
                // console.log('ini tanggal-',date, 'ini area id-', area_id, 'ini store id -', store_id, 'ini increment-', increment)
                const result = date + area_id + store_id + increment
                console.log('hasil convert',result)
                return result
            }

            function compileDevice() {
                console.log('cek device',app_name, 
                    app_version_code,
                    app_version_name,
                    device_type, 
                    device_brand, 
                    device_manufacturer, 
                    device_model, 
                    device_os_sdk, 
                    device_os_sdk_name, 
                    device_product);
                
                return {
                    app_name, 
                    app_version_code,
                    app_version_name,
                    device_type, 
                    device_brand, 
                    device_manufacturer, 
                    device_model, 
                    device_os_sdk, 
                    device_os_sdk_name, 
                    device_product
                }
            }
    
            function getCustomerData() {
                let templateCustomer = {
                    ktp: `${customer_ktp}`,
                    name: customer_name,
                    email: email ? email : '',
                    reason: customer_reason,
                    address: customer_address,
                    province: 'Daerah Khusus Ibukota Jakarta',
                    regency: 'Kota Adm. Jakarta Selatan',
                    district: 'Kebayoran Baru',
                    bank_name: null,
                    birth_date: customer_birthdate,
                    bank_account: 'null',
                    phone_number: customer_phone,
                    relatives_name: relative_name,
                    relatives_address: relative_address,
                    relatives_regency: 'Kota Adm. Jakarta Selatan',
                    relatives_province: 'Daerah Khusus Ibukota Jakarta',
                    relatives_phone_number: relative_phone,
                    relatives_relationship: relative_relationship
                }
                console.log('cek customer ktp',customer_ktp)
                return customerJSON[customer_ktp]
            }
    
            function compileHpPhotos(){
                let id_folder = trans_id(id)
                let photoObject = {
                    imei: {uploaded: true},
                    penggadai: {uploaded: true},
                    box: {uploaded: true},
                    charger: {uploaded: true},
                    tampak_depan: {uploaded: true},
                    tampak_belakang: {uploaded: true},
                    tampak_kiri: {uploaded: true},
                    tampak_kanan: {uploaded: true}
                }
                if(outputTransJSON[id]){
                    let contentList = fs.readdirSync(progressPhotoPath+'/'+id_folder)
                    let list = Object.keys(photoObject)
                    list.forEach((value) => {
                        if(contentList.indexOf(`${value}.jpg`) !== -1){
                            photoObject[value].uploaded = true
                        }else{
                            photoObject[value].uploaded = false
                        }
                    })
                }
                return photoObject              
            }
    
            function compileHpConditions(){
                let arrReason = hp_condition.split('\n').filter((value) => value !== '')
                // console.log('ini arr reason', arrReason);
                
                let reasonsOnly = arrReason.slice(1, arrReason.length)
                return {
                    type: arrReason[0],
                    reasons: reasonsOnly
                }
            }
    
            function countLoanCost(){
                return loan_payback - loan_deal
            }
    
            function countPlatformCost(){
                let loan_cost = loan_payback - loan_deal
                let platform_cost = platform_rate/100 * loan_cost
                console.log('ini platform cost', platform_cost);
                
                return platform_cost
            }

            function getAgenId(){
                console.log('cek agen id', uid);
                let new_agen_id = agenJSON[uid] ? agenJSON[uid].id : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                return new_agen_id
            }

            function getAgenData(){
                console.log('cek agen data', uid);
                
                let data = agenJSON[uid] ? agenJSON[uid] : {} 
                return data
            }

            function compileSearch(){
                let agen_data = getAgenData(uid)
                let search = `${trans_id(id)} ${trans_id(id).substr(8,6)} ${agen_data.store_name} ${customer_phone}`
                return search
            }

            const result = {
            newTrans : {
                    calculation_id: id_unique,
                    transaction_id: trans_id(id),
                    hp_imei,
                    hp_type,
                    hp_photos : compileHpPhotos(),
                    hp_condition: compileHpConditions(),
                    loan_maximum,
                    loan_deal,
                    loan_payback,
                    loan_cost: countLoanCost(),
                    loan_cost_percentage: loan_interest,
                    loan_admin: admin,
                    loan_participation: store_participation_value,
                    loan_deal_after_participation: loan_deal - store_participation_value,
                    platform_cost: countPlatformCost(),
                    loan_insurance: insurance,
                    loan_admin_agen: store_comission,
                    loan_duration,
                    loan_start,
                    loan_finish,
                    status: state,
                    status_detail: {},
                    customer_ktp: `${customer_ktp}`,
                    customer_data: getCustomerData(),
                    agen_id: getAgenId(),
                    agen_data: getAgenData(),
                    search: compileSearch(),
                    device_data: compileDevice(),
                },
            newBidTrans : {
                    id_lender: 'bhicmohhq9mmkp5ewpxmox80b29azk',
                    bid_start: moment(`${loan_start}`).format(),
                    loan_start,
                    loan_duration,
                    loan_finish,
                    loan_deal,
                    lender_deal: loan_deal - store_participation_value,
                }
            }
            return result
        }

        function compileUpdateBidTrans(bidTrans, {status}) {
            let active = [1, 2, 3, 11, 12]
            let failPayment = [4, 5, 6]
            let due = [13]
            let finish = [31, 51, 61]
            if(active.indexOf(status) !== -1){
                bidTrans.status = 0
            }else if(failPayment.indexOf(status) !== -1){
                bidTrans.status = 3
            }else if(due.indexOf(status) !== -1){
                bidTrans.status = 2
            }else if(finish.indexOf(status) !== -1){
                bidTrans.status = 1
            }
            bidTrans.notification = 0
            return bidTrans
        }

        function insertTrans(params) {
            // console.log('ini params di migrate rest client', params)
            return axios.put('https://api.agenkan.com/staging/transaction/transaction/migrate', {...params}, {
                headers: {
                    type: "CMS",
                    version: "2.00",
                    Authorization: `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImtiNG81ZGU3eWVnamdsZ3lqcW9vNXpxMjhqODMxayIsInBlcm1pc3Npb25zIjpbIkFETUlOIiwiQUdFTl9BUFBST1ZBTCIsIkFHRU5fQ0hFQ0tFUiIsIkFHRU5fTUFLRVIiLCJBUkVBX0NIRUNLRVIiLCJBUkVBX01BS0VSIiwiQkFOS19DSEVDS0VSIiwiQkFOS19NQUtFUiIsIkNBTlZBU1NFUl9DSEVDS0VSIiwiQ1VTVE9NRVIiLCJDQU5WQVNTRVJfTUFLRVIiLCJHRU5FUkFMX0NIRUNLRVIiLCJHRU5FUkFMX01BS0VSIiwiSEFSR0FfQ0hFQ0tFUiIsIkhBUkdBX01BS0VSIiwiSE9MSURBWV9DSEVDS0VSIiwiSE9MSURBWV9NQUtFUiIsIklOVEVSRVNUX0NIRUNLRVIiLCJJTlRFUkVTVF9NQUtFUiIsIk1TQV9DSEVDS0VSIiwiTVNBX01BS0VSIiwiUEFSVElDSVBBVElPTl9DSEVDS0VSIiwiUEFSVElDSVBBVElPTl9NQUtFUiIsIlFVRVNUSU9OX0NIRUNLRVIiLCJRVUVTVElPTl9NQUtFUiIsIlJFQVNPTiIsIlJFTEFUSU9OU0hJUF9DSEVDS0VSIiwiUkVMQVRJT05TSElQX01BS0VSIiwiU0FMRVNfQ0hFQ0tFUiIsIlNBTEVTX01BS0VSIiwiU0VUVElOR19DSEVDS0VSIiwiU0VUVElOR19NQUtFUiIsIlRJRVJTIiwiVFJBTlNBQ1RJT05fQ0hFQ0tFUiIsIlRSQU5TQUNUSU9OX01BS0VSIl0sImlhdCI6MTU3MTcxODg5NX0.yz7PBlbkzHSFzKiWbr3x7yqmcrdXLw7nrvkA5J1pmpF3MWObBiV0Zg1-SE9RQZD4uiDu1StdulfbwQ4KnP7ApQ`
                }
            })
        }

        function updateBidTransaction(params) { // untuk dijalankan, update nettgain harus di comment dulu di update bid transaction
            console.log
            return axios.post(`https://api.agenkan.com/staging/loan/bidTransaction/${params.id}`, {...params}, {
                headers: {
                    type: "CMS",
                    version: "2.00",
                    Authorization: `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImtiNG81ZGU3eWVnamdsZ3lqcW9vNXpxMjhqODMxayIsInBlcm1pc3Npb25zIjpbIkFETUlOIiwiQUdFTl9BUFBST1ZBTCIsIkFHRU5fQ0hFQ0tFUiIsIkFHRU5fTUFLRVIiLCJBUkVBX0NIRUNLRVIiLCJBUkVBX01BS0VSIiwiQkFOS19DSEVDS0VSIiwiQkFOS19NQUtFUiIsIkNBTlZBU1NFUl9DSEVDS0VSIiwiQ1VTVE9NRVIiLCJDQU5WQVNTRVJfTUFLRVIiLCJHRU5FUkFMX0NIRUNLRVIiLCJHRU5FUkFMX01BS0VSIiwiSEFSR0FfQ0hFQ0tFUiIsIkhBUkdBX01BS0VSIiwiSE9MSURBWV9DSEVDS0VSIiwiSE9MSURBWV9NQUtFUiIsIklOVEVSRVNUX0NIRUNLRVIiLCJJTlRFUkVTVF9NQUtFUiIsIk1TQV9DSEVDS0VSIiwiTVNBX01BS0VSIiwiUEFSVElDSVBBVElPTl9DSEVDS0VSIiwiUEFSVElDSVBBVElPTl9NQUtFUiIsIlFVRVNUSU9OX0NIRUNLRVIiLCJRVUVTVElPTl9NQUtFUiIsIlJFQVNPTiIsIlJFTEFUSU9OU0hJUF9DSEVDS0VSIiwiUkVMQVRJT05TSElQX01BS0VSIiwiU0FMRVNfQ0hFQ0tFUiIsIlNBTEVTX01BS0VSIiwiU0VUVElOR19DSEVDS0VSIiwiU0VUVElOR19NQUtFUiIsIlRJRVJTIiwiVFJBTlNBQ1RJT05fQ0hFQ0tFUiIsIlRSQU5TQUNUSU9OX01BS0VSIl0sImlhdCI6MTU3MTcxODg5NX0.yz7PBlbkzHSFzKiWbr3x7yqmcrdXLw7nrvkA5J1pmpF3MWObBiV0Zg1-SE9RQZD4uiDu1StdulfbwQ4KnP7ApQ`
                }
            })
        }

        function createBidTransaction(params) {
            return axios.put('https://api.agenkan.com/staging/loan/bidTransaction/', {...params}, {
                headers: {
                    type: "CMS",
                    version: "2.00",
                    Authorization: `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImtiNG81ZGU3eWVnamdsZ3lqcW9vNXpxMjhqODMxayIsInBlcm1pc3Npb25zIjpbIkFETUlOIiwiQUdFTl9BUFBST1ZBTCIsIkFHRU5fQ0hFQ0tFUiIsIkFHRU5fTUFLRVIiLCJBUkVBX0NIRUNLRVIiLCJBUkVBX01BS0VSIiwiQkFOS19DSEVDS0VSIiwiQkFOS19NQUtFUiIsIkNBTlZBU1NFUl9DSEVDS0VSIiwiQ1VTVE9NRVIiLCJDQU5WQVNTRVJfTUFLRVIiLCJHRU5FUkFMX0NIRUNLRVIiLCJHRU5FUkFMX01BS0VSIiwiSEFSR0FfQ0hFQ0tFUiIsIkhBUkdBX01BS0VSIiwiSE9MSURBWV9DSEVDS0VSIiwiSE9MSURBWV9NQUtFUiIsIklOVEVSRVNUX0NIRUNLRVIiLCJJTlRFUkVTVF9NQUtFUiIsIk1TQV9DSEVDS0VSIiwiTVNBX01BS0VSIiwiUEFSVElDSVBBVElPTl9DSEVDS0VSIiwiUEFSVElDSVBBVElPTl9NQUtFUiIsIlFVRVNUSU9OX0NIRUNLRVIiLCJRVUVTVElPTl9NQUtFUiIsIlJFQVNPTiIsIlJFTEFUSU9OU0hJUF9DSEVDS0VSIiwiUkVMQVRJT05TSElQX01BS0VSIiwiU0FMRVNfQ0hFQ0tFUiIsIlNBTEVTX01BS0VSIiwiU0VUVElOR19DSEVDS0VSIiwiU0VUVElOR19NQUtFUiIsIlRJRVJTIiwiVFJBTlNBQ1RJT05fQ0hFQ0tFUiIsIlRSQU5TQUNUSU9OX01BS0VSIl0sImlhdCI6MTU3MTcxODg5NX0.yz7PBlbkzHSFzKiWbr3x7yqmcrdXLw7nrvkA5J1pmpF3MWObBiV0Zg1-SE9RQZD4uiDu1StdulfbwQ4KnP7ApQ`
                }
            })
        }

        let rejectTrans = {data: []}
        let outputTrans = {}
        let outputBidTrans = {}
        await getGeneralForm()
        console.log('ini data bang', data.length)
        for(let i = 0 ; i < data.length ; i++){
            console.log('ini data koe', i , data[i].id)
            const {id} = data[i]
            // console.log('ini hp condition', data[i].hp_condition.split('\n').filter((value) => value !== ''))
            let {newTrans, newBidTrans} = compileData(data[i])
            // console.log('cek bos',compiledData)
            if(newTrans.status !== 0){
                await insertTrans(newTrans)
                    .then(({data})=> {
                        // console.log('ini data hasil axios insert trans',data)
                        outputTrans[id] = data.payload
                        newBidTrans.id_transaction = data.payload.id
                        return createBidTransaction(newBidTrans)
                    })
                    .then(({data}) => {
                        // console.log('ini data hasil axios bid transaction', data)
                        // outputBidTrans[data.payload.id] = data.payload
                        let updatedBidTrans = compileUpdateBidTrans(data.payload, newTrans)
                        // console.log('ini updated bid trans', updatedBidTrans);
                        
                        return updateBidTransaction(updatedBidTrans)
                    })
                    .then(({data}) => {
                        outputBidTrans[data.payload.id] = data.payload
                    })
                    .catch((err) => {
                        console.log('ini error insert trans dan bid trans',err);
                        data[i].reject = err.response.data.message
                        rejectTrans.data.push(data[i])
                    })
            }else{
                await insertTrans(newTrans)
                    .then(({data}) => {
                        outputTrans[id] = data.payload
                        data.payload.reject = 'status 0, maka tidak dibuat di bid trans'
                        rejectTrans.data.push(data.payload)
                    })
                    .catch((err) => {
                        console.log('ini error di insert trans tanpa bid trans',err);
                        data[i].reject = err.response.data.message
                        rejectTrans.data.push(data[i])
                    })
            }
        }
        fs.writeFileSync('./api/data/reject-transaction.json', JSON.stringify(rejectTrans), (err) => {
            if(err){
                throw err
            }
        })
        fs.writeFileSync('./api/data/output-transaction.json', JSON.stringify(outputTrans), (err) => {
            if(err){
                throw err
            }
        })
        fs.writeFileSync('./api/data/output-bidtrans.json', JSON.stringify(outputBidTrans), (err) => {
            if(err){
                throw err
            }
        })
    }
    catch(e) {
        console.log('error boss',e)
    }
})()