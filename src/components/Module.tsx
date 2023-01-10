import React from 'react';
import { Box } from '@mui/material';
import { useDrag, useDragDropManager, XYCoord } from 'react-dnd';
import { useRafLoop } from 'react-use';

import ModuleInterface from '../types/ModuleInterface';
import { moduleW2LocalWidth, moduleX2LocalX, moduleY2LocalY } from '../helpers';

import { useRecoilState } from 'recoil';
import { heightState } from '../recoil/recoil';



type ModuleProps = {
  data: ModuleInterface;
  containerHeight: number;
};

const Module = (props: ModuleProps) => {
  const { data: { id, coord: { x, y, w, h } }, containerHeight } = props;

  // Transform x, y to left, top
  const [{ top, left }, setPosition] = React.useState(() => ({
    top: moduleY2LocalY(y),
    left: moduleX2LocalX(x),
  }));


  const [, setHeightgrow] = useRecoilState(heightState);


  const dndManager = useDragDropManager();
  const initialPosition = React.useRef<{ top: number; left: number }>();

  // Use request animation frame to process dragging
  const [stop, start] = useRafLoop(() => {
    const movement = dndManager.getMonitor().getDifferenceFromInitialOffset();

    // new conditions

    const shadowPosition: XYCoord | null  = dndManager.getMonitor().getSourceClientOffset();

    const boxWidth = moduleW2LocalWidth(w);
    const bottomEdge = shadowPosition.y + h;
    let rightEdgePoint = left + boxWidth;
    let rightEdgePosition = 1024 - boxWidth;

    if (!initialPosition.current || !movement) {
      return;
    }

    // freely changing position of the module
    setPosition({
      top: initialPosition.current.top + movement.y,
      left: initialPosition.current.left + movement.x,
    });

    // conditions for top edge movement
    if (top < 0 || shadowPosition.y <= 25) {
      setPosition({
        top: 0,
        left: initialPosition.current.left + movement.x,
      });    
    }


    // conditions for left edge movement
    if (left < 0 || shadowPosition.x <= 110) {
      setPosition({
        top: initialPosition.current.top + movement.y,
        left: 0,
      });
    } 

    // conditions for right edge movement
    if (rightEdgePoint > 1024 || shadowPosition.x >= 865) {
      setPosition({       
        top: initialPosition.current.top + movement.y,
        left: rightEdgePosition,
      });
    }

    // conditions for top left corner movement
    if (top < 0 && left < 0 || shadowPosition.x <= 110 && shadowPosition.y <= 25) {
      setPosition({
        top: 0,
        left: 0,
      });    
    }

    // condition for top right corner movement
    if (top < 0 && rightEdgePoint > 1024 || shadowPosition.x >= 865 && shadowPosition.y <= 25) {
      setPosition({
        top: 0,
        left: rightEdgePosition,
      });    
    }

    //conditions for bottom wall
    if (top >= containerHeight - h) {    
      // @ts-expect-error
      setHeightgrow(bottomEdge);
    }
  }, false);

  // Wire the module to DnD drag system
  const [, drag] = useDrag(() => ({
    type: 'module',
    item: () => {
      // Track the initial position at the beginning of the drag operation
      initialPosition.current = { top, left };

      // Start raf
      start();
      return { id };
    },

    end: stop,
  }), [top, left]);

  return (
    <Box
      ref={drag}
      display="flex"
      position="absolute"
      border={1}
      borderColor="grey.500"
      padding="10px"
      bgcolor="rgba(0, 0, 0, 0.5)"
      top={top}
      left={left}
      width={moduleW2LocalWidth(w)}
      height={h}
      sx={{
        transitionProperty: 'top, left',
        transitionDuration: '0.1s',
        '& .resizer': {
          opacity: 0,
        },
        '&:hover .resizer': {
          opacity: 1,
        },
      }}
    >
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize={40}
        color="#fff"
        sx={{ cursor: 'move' }}
        draggable
      >
        <Box sx={{ userSelect: 'none', pointerEvents: 'none' }}>{id}</Box>
      </Box>
    </Box>
  );
};

export default React.memo(Module);
