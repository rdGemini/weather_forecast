import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useWeatherContext } from './WeatherContext';

interface MainWeatherData {
  temp: number;
  humidity: number;
  pressure: number;
}

interface Weather {
  main: string;
  description: string;
}

interface WeatherData {
  main: MainWeatherData;
  weather: Weather[];
}

interface WeatherPageProps {
  cityName: string;
}

const getBackgroundImage = (weatherData: WeatherData) => {
  console.log(weatherData.weather[0].main);
  switch (weatherData.weather[0].main) {
    case 'Clear':
      return `url(${process.env.PUBLIC_URL}/images/ClearSky.jpg)`;
    case 'Clouds':
      return `url(${process.env.PUBLIC_URL}/images/Clouds.jpg)`;
    case 'Rain':
      return `url(${process.env.PUBLIC_URL}/images/Rainy.jpg)`;
    case 'Mist':
      return `url(${process.env.PUBLIC_URL}/images/Rainy.jpg)`;
    default:
      return `url(${process.env.PUBLIC_URL}/images/Sunny.jpg)`;
  }
};

const WeatherPage: React.FC<WeatherPageProps> = ({ cityName }) => {
  const { weatherData, setWeatherData } = useWeatherContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<WeatherData>(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=c07c22d32a8652423894198a160b2e2b`
        );
        setWeatherData(response.data);
        setError(null);
        document.body.style.backgroundImage = getBackgroundImage(response.data);
        document.body.style.backgroundSize = window.innerWidth <= 768 ? '420%' : '220%';
        document.body.style.backgroundPosition = 'center'; 
        document.body.style.backgroundRepeat = 'repeat'; 
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError('Error fetching weather data. Please try again.');
      }
    };

    fetchData();
  }, [cityName, setWeatherData]);

  return (
    <WeatherContainer>
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <WeatherInfo>
          <h2>{cityName} Weather</h2>
          {weatherData && (
            <div>
              <p>Temperature: {weatherData.main.temp} °C</p>
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Pressure: {weatherData.main.pressure} hPa</p>
              <p>
                Weather: {weatherData.weather[0].main} - {weatherData.weather[0].description}
              </p>
            </div>
          )}
        </WeatherInfo>
      )}
    </WeatherContainer>
  );
};

const ErrorMessage = styled.div`
  color: red;
  font-weight: bold;
`;

const WeatherContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const WeatherInfo = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export default WeatherPage;
