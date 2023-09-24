import React, { useEffect, useState } from 'react';
import { getProperties, getNames, postPricingPeriods } from '../services/services';
import Checkbox from './Checkbox';
const Empty = () => {

    const [checkboxes, setCheckboxes] = useState({});
    const [checkedIndices, setCheckedIndices] = useState([]);
    const [names, setNames] = useState([])
    const [baseRates, setBaseRates] = useState([])
    const [properties, setProperties] = useState([])

    const [minClamp, setMinClamp] = useState(0)
    const [maxClamp, setMaxClamp] = useState(0)

    const [minClampList, setMinClampList] = useState([])
    const [maxClampList, setMaxClampList] = useState([])

    const [weekendRate, setWeekendRate] = useState(0)
    const [minimumStay, setMinimumStay] = useState(0)
    const [weekendMinimumStay, setWeekendMinimumStay] = useState(0)

    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)

    const propertyList = async() => {
        try{
            let response = await getProperties();
            // console.log(response)
            Object.keys(response).forEach(key => {
                response[key].forEach((properyUid) => {
                    namesList(properyUid);
                    setProperties((prevProperties) => [...prevProperties, properyUid]);
                })
            })
        } catch (error) {
            console.log(error);
        }
    } 

    const namesList = async(properyUid) => {
        try{
            let response = await getNames(properyUid);
            // console.log(properyUid, response);
            setNames((prevNames) => [...prevNames, response.name]);
            setBaseRates((prevBaseRates) => [...prevBaseRates, response.baseDailyRate]);
        } catch (error) {
            console.log(error);
        }
    }

    const postBaseRates = async(requestObj) => {
        try{
            let response = await postPricingPeriods(requestObj);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }

    const handleCheckboxChange = (name, index) => {
        const isChecked = checkboxes[name];

        // Create a copy of the checkedIndices array
        const newCheckedIndices = [...checkedIndices];
      
        if (isChecked) {
          // If the checkbox is checked, remove its index from the array
          const indexToRemove = newCheckedIndices.indexOf(index);
          if (indexToRemove !== -1) {
            newCheckedIndices.splice(indexToRemove, 1);
          }
        } else {
          // If the checkbox is unchecked, add its index to the array
          newCheckedIndices.push(index);
        }
      
        // Update the state with the new array of checked indices
        setCheckedIndices(newCheckedIndices);
      
        setCheckboxes({
            ...checkboxes,
            [name]: !checkboxes[name],
        });

    };

    const handleMinClampChange = () => {
        const tempList = baseRates.map((data) => {
            const tempMinClamp = Math.round((data * minClamp) / 100);
            return tempMinClamp;
        })
        setMinClampList(tempList);
        console.log(tempList);
    }

    const handleMaxClampChange = () => {
        const tempList = baseRates.map((data) => {
            const tempMaxClamp = Math.round((data * maxClamp) / 100);
            return tempMaxClamp;
        })
        setMaxClampList(tempList);
        console.log(tempList);
    }

    const changeDateFormat = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because it's zero-based
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate;
    }

    const handleSubmit = () => {
        let submitRates = [];

        checkedIndices.map(index => {
            let fromDate = new Date();

            console.log('From', startDate.toLocaleDateString(),'To', endDate.toLocaleDateString())
            while(fromDate < endDate){
                let remainDay = 0;
                let isWeekend = false;
                let returnClamp = 0;

                isWeekend = (fromDate.getDay() === 0 || fromDate.getDay() > 4) ? true : false;

                if(endDate - fromDate < 259200000){
                    remainDay = Math.round((endDate - fromDate) / 86400000);
                }else if(isWeekend){
                    remainDay = (7 - fromDate.getDay() + 1) % 7
                }else if(!isWeekend){
                    remainDay = 5 - fromDate.getDay()
                }

                if(isWeekend) { 
                    const tempBaseRate = baseRates.map(data => {
                        return Math.round((data * weekendRate) / 100)
                    })
                    setBaseRates(tempBaseRate);
        
                    if(minClamp > weekendRate){
                        returnClamp = 1;
                    }else if(maxClamp < weekendRate){
                        returnClamp = 2;
                    }
                }else {
                    if(minClamp > 100){
                        returnClamp = 1;
                    }else if(maxClamp < 100){
                        returnClamp = 2;
                    }
                }

                switch(returnClamp){
                    case 0:
                        submitRates = baseRates;
                        break;
                    case 1:
                        submitRates = minClampList;
                        break;
                    case 2:
                        submitRates = maxClampList;
                        break;
                    default:
                        break;
                }

                // console.log(returnClamp, isWeekend, submitRates)

                const futureDate = new Date(fromDate);

                // console.log(fromDate.toLocaleDateString(undefined, options))

                futureDate.setDate(fromDate.getDate() + remainDay);

                const requestObj = {
                    "propertyUid": properties[index],
                    "amount": submitRates[index],
                    "minimumStay": isWeekend ? weekendMinimumStay : minimumStay,
                    "from": changeDateFormat(fromDate),
                    "to": changeDateFormat(futureDate),
                }
    
                fromDate = futureDate;
                postBaseRates(requestObj);
            }
        })
    }

    useEffect(() => {
        propertyList();

        const currentDate = new Date();
        const futureDate = new Date(currentDate);
        futureDate.setDate(currentDate.getDate() + 30);
        
        setStartDate(currentDate);
        setEndDate(futureDate);
        debugger
    }, [])


    return (
        <div className='grid grid-cols-2 gap-10 text-xl p-10'>
            <div>
                {
                    names.map((name, index) => (
                        <Checkbox 
                            key={index} 
                            label={name} 
                            value={!!checkboxes[name]}
                            onChange={() => handleCheckboxChange(name, index)}
                        />
                    ))
                }
            </div>
            <div className='text-start'>
                    <div className='p-2 flex'>
                        <label className='w-[180px]'>Min Clamp</label>
                        <input
                            value={minClamp}
                            type="number"
                            className="rounded-md border-0 p-1.5 ml-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(event) => setMinClamp(event.target.value ? parseInt(event.target.value) : 0)}
                            onBlur={handleMinClampChange}
                        />                
                    </div>
                    <div className='p-2 flex'>
                        <label className='w-[180px]'>Max Clamp</label>
                        <input
                            value={maxClamp}
                            type="number"
                            className="rounded-md border-0 p-1.5 ml-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(event) => setMaxClamp(parseInt(event.target.value))}
                            onBlur={handleMaxClampChange}
                        /> 
                    </div>
                    <div className='p-2 flex'>
                        <label className='w-[180px]'>Weekend Rate</label>
                        <input
                            value={weekendRate}
                            type="number"
                            className="rounded-md border-0 p-1.5 ml-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(event) => setWeekendRate(parseInt(event.target.value))}
                        /> 
                    </div>
                    <div className='p-2 flex'>
                        <label className='w-[180px]'>Minimum Stay</label>
                        <input
                            value={minimumStay}
                            type="number"
                            className="rounded-md border-0 p-1.5 ml-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(event) => setMinimumStay(parseInt(event.target.value))}
                        /> 
                    </div>
                    <div className='p-2 flex'>
                        <label className='w-[180px]'>Weekend Minimum Stay</label>
                        <input
                            value={weekendMinimumStay}
                            type="number"
                            className="rounded-md border-0 p-1.5 ml-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(event) => setWeekendMinimumStay(parseInt(event.target.value))}
                        /> 
                    </div>
                    <div className='py-5'>
                        <button onClick={handleSubmit} className='w-48 px-4 py-3 text-sm text-gray-600 font-semibold rounded-full border border-gray-200 hover:text-white hover:bg-gray-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2'>
                            Submit
                        </button>
                    </div>
            </div>
        </div>
    );
}

export default Empty;