import React from 'react';
import dewanImage from './Dewan.png';
import rajputImage from './Rajput.png';
import kunal from './kunal.jpg';
import sarthak from './sarthak.png';

interface ProfileImageProps {
  className?: string;
}

export const DewanImage: React.FC<ProfileImageProps> = ({ className = "w-16 h-16" }) => (
  <img 
    src={dewanImage} 
    alt="Dhruv Dewan" 
    className={`${className} rounded-full object-cover`}
  />
);

export const SharmaImage: React.FC<ProfileImageProps> = ({ className = "w-16 h-16" }) => (
  <img 
    src={kunal} 
    alt="Kunal Sharma" 
    className={`${className} rounded-full object-cover`}
  />
);

export const SrivastavaImage: React.FC<ProfileImageProps> = ({ className = "w-16 h-16" }) => (
  <img 
    src={sarthak} 
    alt="Sarthak Srivastava" 
    className={`${className} rounded-full object-cover`}
  />
);

export const RajputImage: React.FC<ProfileImageProps> = ({ className = "w-16 h-16" }) => (
  <img 
    src={rajputImage} 
    alt="Dhruv Rajput" 
    className={`${className} rounded-full object-cover`}
  />
); 