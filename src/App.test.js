import React from 'react';
import ReactDOM from 'react-dom';
import Quill from './quill';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Quill />, div);
  ReactDOM.unmountComponentAtNode(div);
});
