// import React from 'react';
// import '../../styles/Scaler.css'

// function Scaler(props) {
//   return (
//     <div className="scaler">
//       {props.children}
//     </div>
//   );
// }

// export default Scaler;



import React, { useContext, createContext } from 'react';
import '../styles/Scaler.css'

const ScaleContext = createContext(1);

function Scaler(props) {
  const scale = getCurrentScale();

  return (
    <ScaleContext.Provider value={scale}>
      <div className="scaler">
        {props.children}
      </div>
    </ScaleContext.Provider>
  );
}

function getCurrentScale() {
  const width = window.innerWidth;

  if (width <= 600) {
    return 0.83;
  } else if (width <= 669) {
    return 0.88;
  } else if (width <= 739) {
    return 0.91;
  } else if (width <= 809) {
    return 0.94;
  } else if (width <= 879) {
    return 0.97;
  } else if (width <= 949) {
    return 1.00;
  } else if (width <= 1019) {
    return 1.03;
  } else if (width <= 1089) {
    return 1.06;
  } else if (width <= 1159) {
    return 1.09;
  } else if (width <= 1198) {
    return 1.12;
  } else if (width >= 1199) {
    return 1.15;
  }
  return 1;
}


export function useScale() {
  return useContext(ScaleContext);
}

export default Scaler;
