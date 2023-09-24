import React from 'react';

const Checkbox = ({label, value, onChange}) => {

    return (
        <div className='flex justify-start p-1 '>
            <label>
                <input type='checkbox' checked={value} onChange={onChange} className='mr-2'/>
                {label}
            </label>
        </div>
    );
}

export default Checkbox;