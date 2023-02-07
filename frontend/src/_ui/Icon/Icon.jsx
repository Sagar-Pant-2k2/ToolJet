import React from 'react';
import './Icon.scss';
import Icon from './allIcons/index.js';

const IconEl = (props) => {
  const { name, ...restProps } = props;
  return <Icon {...props} name={name} />;
};
export default IconEl;
