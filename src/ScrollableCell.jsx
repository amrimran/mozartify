import React from 'react';
import { TableCell } from '@mui/material';
import './ScrollableCell.css'; // Make sure to create this CSS file

const ScrollableCell = ({ content }) => {
  return (
    <TableCell className="scrollable-cell">
      <div className="scrollable-content">
        {content}
      </div>
    </TableCell>
  );
};

export default ScrollableCell;
