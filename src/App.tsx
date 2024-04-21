import React, { useState } from 'react';
import CitiesTable from './CitiesTable';
import WeatherPage from './WeatherPage';
import ReactDOM from 'react-dom';
import { WeatherProvider } from './WeatherContext';
import { City } from './City';

const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);

  const handleCityClick = (cityName: string) => {
    setSelectedCity(cityName);
  };

  return (
    <WeatherProvider>
      <div>
        {selectedCity ? (
          <WeatherPage cityName={selectedCity} />
        ) : (
          <CitiesTable cities2={cities} onCityClick={handleCityClick} />
        )}
      </div>
    </WeatherProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <WeatherProvider>
      <App />
    </WeatherProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

export default App;