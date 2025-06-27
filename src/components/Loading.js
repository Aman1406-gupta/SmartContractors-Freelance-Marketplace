import React, { useEffect, useState } from 'react';


const Loading = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 2000); 

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`loading-screen ${visible ? '' : 'fade-out'}`}>
      
    </div>
  );
};

export default Loading;