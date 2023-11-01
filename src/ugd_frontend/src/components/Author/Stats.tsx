import React, { useEffect, useRef } from 'react';
import '../../styles/AuthorStats.css';
import { useAuthors } from '../../contexts/AuthorContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const Stats = () => {
  const { stats } = useAuthors();

  return (
    // <div className='text-sm flex flex-grow flex-col w-full py-1 gap-2 bg-[#E5EBAE]'>
    //   <div className='flex w-auto justify-center items-center'>
    //     <span>Rating: </span>
    //     <FontAwesomeIcon icon={faStar} className='text-[#fc0] p-2' />
    //     <FontAwesomeIcon icon={faStar} className='text-[#fc0] p-2' />
    //     <FontAwesomeIcon icon={faStar} className='text-[#fc0] p-2' />
    //     <FontAwesomeIcon icon={faStar} className='text-[#fc0] p-2' />
    //     <FontAwesomeIcon icon={faStar} className='text-white p-2' />
    //   </div>
    //   <table className='table-fixed border-seperate border-spacing-2'>
    //     <tbody>
    //       <tr>
    //         <th>TTS</th>
    //         <td>3.6m</td>
    //         <th>CPT</th>
    //         <td>$0.024</td>
    //         <th>30d</th>
    //         <td>623k</td>
    //       </tr>
    //       <tr>
    //         <th>MP</th>
    //         <td>$15</td>

    //         <th>CBT</th>
    //         <td>$0.004</td>

    //         <th>90d</th>
    //         <td>923k</td>
    //       </tr>
    //       <tr>
    //         <th></th>
    //         <td></td>
    //         <th>AP</th>
    //         <td>--</td>
    //         <th>Age</th>
    //         <td>8mo</td>
    //       </tr>
    //     </tbody>
    //   </table>
    //   <table className='table-fixed border-seperate border-spacing-2'>
    //     <tbody>
    //       <tr>
    //         <th>AI-Model</th>
    //         <td>Lamma-002</td>
    //         <th>Vectors</th>
    //         <td>ada-002</td>
    //       </tr>
    //     </tbody>
    //   </table>

    //   <div className='flex flex-wrap gap-0.5'>
    //     <span className='font-bold px-2 '>Training</span>
    //     <span className='border-2 border-solid border-black rounded-full px-1 mx-1'> #5.21G Tokens </span>
    //     <span className='border-2 border-solid border-black rounded-full px-1 mx-1'> #4 Epochs </span>
    //     <span className='border-2 border-solid border-black rounded-full px-1 mx-1'> #35 Books </span>
    //     <span className='border-2 border-solid border-black rounded-full px-1 mx-1'> #57,829 cells </span>
    //   </div>
    // </div>
    <div></div>
  );
};

export default Stats;
