import React, { createContext, useContext, useState } from 'react';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
}

interface WeatherContextType {
  weatherData: WeatherData | null;
  setWeatherData: (data: WeatherData | null) => void;
}


const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const useWeatherContext = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }
  return context;
};

interface WeatherProviderProps {
    children: React.ReactNode;
  }

  export const WeatherProvider: React.FC<WeatherProviderProps> = ({ children }) => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  
    return (
      <WeatherContext.Provider value={{ weatherData, setWeatherData }}>
        {children}
      </WeatherContext.Provider>
    );
  };

export default WeatherContext;
