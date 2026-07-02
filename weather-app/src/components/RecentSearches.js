import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  border: 1px solid #ddd;
  padding: 16px;
  margin: 16px;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const formatSearchTime = (searchedAt) => {
  if (!searchedAt) {
    return 'Unknown time';
  }

  const date = new Date(searchedAt);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return `${date.toLocaleString(undefined, { timeZone: 'UTC' })} UTC`;
};

const RecentSearches = ({ searches, isLoading, isUnavailable }) => {
  return (
    <Container>
      <h2>Recent Searches</h2>
      {isLoading && <p>Loading recent searches...</p>}
      {!isLoading && isUnavailable && <p>Recent searches are unavailable.</p>}
      {!isLoading && !isUnavailable && searches.length === 0 && (
        <p>No recent searches yet.</p>
      )}
      {!isLoading && !isUnavailable && searches.length > 0 && (
        <List>
          {searches.map((search) => (
            <li key={search.id}>
              {search.city_name} - {formatSearchTime(search.searched_at)}
            </li>
          ))}
        </List>
      )}
    </Container>
  );
};

export default RecentSearches;
