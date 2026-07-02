import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the weather search form', () => {
  render(<App />);

  expect(screen.getByPlaceholderText(/enter city/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  expect(screen.getByText(/search for a city/i)).toBeInTheDocument();
});
