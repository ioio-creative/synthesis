import React, {useState, useEffect, useRef} from 'react';

const useDeviceOrientation = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [direction, setDirection] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [angle, setAngle] = useState(0);
  const [moveCounter, setMoveCounter] = useState(0);
  let prevAngle = useRef(0);
  let prevTime = useRef(0);
  useEffect(() => {
    if (permissionGranted) {
      window.addEventListener('deviceorientation', updateDeviceStatus, false);
    }
    return () => {
      window.removeEventListener('deviceorientation', updateDeviceStatus, false);
    }
  }, [permissionGranted]);

  let lastAccVec3 = [null, null, null];
  const threshold = 45;
  const updateDeviceStatus = (event) => {
    const {alpha, beta, gamma} = event;
    const timeNow = Date.now();
    const timeDelta = timeNow - prevTime.current;
    const angleNow = alpha;
    let angleDelta = angleNow - prevAngle.current;
    if (timeDelta > 30) {
      prevTime.current = timeNow;
      prevAngle.current = angleNow;
      setAngle(angleNow);
      setDirection(Math.sign(angleDelta));
      setSpeed(angleDelta);
      if (!(alpha && beta && gamma)) { return; }
      let deltaX = Math.abs(alpha - lastAccVec3[0]);
      let deltaY = Math.abs(beta - lastAccVec3[1]);
      let deltaZ = Math.abs(gamma - lastAccVec3[2]);
      if(deltaX + deltaY + deltaZ > threshold) {
        setMoveCounter((prevMoveCounter) => {
          return prevMoveCounter + 1;
        })
      } else {
        setMoveCounter((prevMoveCounter) => {
          return Math.max(0, prevMoveCounter - 1);
        })
      }
      // setLastAccVec3([alpha, beta, gamma]);
      lastAccVec3 = [alpha, beta, gamma];
    }
  }
  
  return [{
    direction, 
    speed, 
    angle,
    moveCounter,
    permissionGranted
  }, {
    setPermissionGranted,
    setMoveCounter
  }];
}

export default useDeviceOrientation;