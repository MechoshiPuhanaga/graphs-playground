import { render } from '@testing-library/react';

import App from '../App';

describe('<App />', () => {
  it('Mounts without errors', () => {
    render(<App />);
  });
});
