import React from 'react'

interface SkeltonLoadingInterface {
    isSearched?: boolean
}

const SkeltonLoading: React.FC<SkeltonLoadingInterface> = ({ isSearched }) => {
    return (
        <div className='skelton_card_source_loding' style={{ height: isSearched ? '160px' : '80px' }}>
            <div className="image_skelton_loading skeleton"></div>
            <div className="data_skelton_loading">
                <div className="heading_skelton_loading skeleton" style={{ height: isSearched ? '14%' : '30%' }}></div>
                <div className="description_skelton_loading skeleton" style={{ height: isSearched ? '82%' : '65%' }}></div>
            </div>
        </div>
    )
}

export default SkeltonLoading
