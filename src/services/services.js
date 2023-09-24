import axios from 'axios'

export const getProperties = async() => {
    const url = 'https://api.hostfully.com/v2/properties?agencyUid=d3dcb567-03dc-4c17-8918-e119b0bd579d';

    const options = {
        method:'GET',
        url: url,
        headers:{
            accept: 'application/json',
            'X-HOSTFULLY-APIKEY':'tAryEQrD4HRUqAxF'
        }
    }

    try{
        const response = await axios.request(options)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const getNames = async(propertyUid) => {
    const url = 'https://api.hostfully.com/v2/properties/' + propertyUid;

    const options = {
        method:'GET',
        url: url,
        headers:{
            accept: 'application/json',
            'X-HOSTFULLY-APIKEY':'tAryEQrD4HRUqAxF'
        }
    }

    try{
        const response = await axios.request(options)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const postPricingPeriods = async(requestObj) => {
    const url = 'https://api.hostfully.com/v2/pricingperiods/';

    const options = {
        method:'POST',
        url: url,
        headers:{
            accept: 'application/json',
            'X-HOSTFULLY-APIKEY':'tAryEQrD4HRUqAxF',
            'Content-Type':'application/json'
        },
        data: requestObj
    }
    
    try{
        const response = await axios(options)
        return response.data
    } catch (error) {
        console.log(error)
    }
}