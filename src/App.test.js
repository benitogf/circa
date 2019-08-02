import React from 'react';
import ReactDOM from 'react-dom';
import Locks from './Locks';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Locks />, div);
  ReactDOM.unmountComponentAtNode(div);
});
