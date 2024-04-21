import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { City } from './City';
import { Link } from 'react-router-dom';

interface CitiesTableProps {
  cities2: City[]; // Add cities prop
  onCityClick: (cityName: string) => void;
}

const CitiesTable: React.FC<CitiesTableProps> = ({ cities2, onCityClick }) => {
  const [cities, setCities] = useState<City[]>([]); 
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [page, setPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({
    key: '',
    direction: '',
  });
  const observer = useRef<IntersectionObserver | null>(null);

  const lastCityRef = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    []
  );

  const [isSuggestionClicked, setIsSuggestionClicked] = useState(false);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setIsSuggestionClicked(false);
  };

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCities(cities);
      setSuggestions([]);
    } else {
      const newFilteredCities = cities.filter(
        (city) => city.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
      );
      setFilteredCities(newFilteredCities);
      if (!isSuggestionClicked) {
        setSuggestions(newFilteredCities.slice(0, 5)); // Limit the suggestions to the top 5 matches
      }
    }
  }, [searchTerm, cities, isSuggestionClicked]);

  const handleSuggestionClick = (cityName: string) => {
    setSearchTerm(cityName);
    setSuggestions([]);
    setIsSuggestionClicked(true);
    const clickedCity = cities.filter(
      (city) => city.name.toLowerCase() === cityName.toLowerCase()
    );
    setFilteredCities(clickedCity);
  };

  useEffect(() => {
    axios
      .get(
        `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&rows=1000&sort=name&start=${page * 1000}`
      )
      .then((response) => {
        const cityData = response.data.records.map((record: any) => ({
          name: record.fields.name,
          country: record.fields.cou_name_en,
          timezone: record.fields.timezone,
        }));
        setCities((prevCities) => [...prevCities, ...cityData]);
        setFilteredCities((prevCities) => [...prevCities, ...cityData]);
      })
      .catch((error) => {
        console.error('Error fetching city data:', error);
      });
  }, [page]);

  useEffect(() => {
    const filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchTerm, cities]);

  const handleClick = (cityName: string) => {
    onCityClick(cityName);
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedCities = [...filteredCities].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredCities(sortedCities);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
    }
    return faSort;
  };

  const handleRightClick = (cityName: string) => {
    window.open(`https://your-weather-page-url/${cityName}`, '_blank');
  };

  return (
    <Container>
      <SearchInput
        type="text"
        placeholder="Search cities..."
        value={searchTerm}
        onChange={handleSearch}
      />
      {suggestions.length > 0 && (
        <SuggestionsList>
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion.name}
              onClick={() => handleSuggestionClick(suggestion.name)}
            >
              {suggestion.name}
            </Suggestion>
          ))}
        </SuggestionsList>
      )}
      <Table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              City Name{' '}
              <FontAwesomeIcon icon={getSortIcon('name')} style={{ marginLeft: '5px' }} />
            </th>
            <th onClick={() => handleSort('country')}>
              Country{' '}
              <FontAwesomeIcon icon={getSortIcon('country')} style={{ marginLeft: '5px' }} />
            </th>
            <th onClick={() => handleSort('timezone')}>
              Timezone{' '}
              <FontAwesomeIcon icon={getSortIcon('timezone')} style={{ marginLeft: '5px' }} />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredCities.map((city, index) => (
            <TableRow
              key={city.name + index} // Use a unique key
              onClick={() => handleClick(city.name)}
              onContextMenu={(e) => {
                e.preventDefault();
                window.open(`/weather/${city.name}`, '_blank');
              }}
              ref={index === filteredCities.length - 1 ? lastCityRef : null}
            >
              <TableCell>{city.name}</TableCell>
              <TableCell>{city.country}</TableCell>
              <TableCell>{city.timezone}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

const SuggestionsList = styled.ul`
  position: absolute;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
  background-color: #fff;
  z-index: 2;
`;

const Suggestion = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  cursor: pointer;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

export default CitiesTable;
