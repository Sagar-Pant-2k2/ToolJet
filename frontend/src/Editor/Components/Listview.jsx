import React, { useRef, useState, useEffect, useContext } from 'react';
import { SubContainer } from '../SubContainer';
import _ from 'lodash';
import { EditorContext } from '@/Editor/Context/EditorContextWrapper';

export const Listview = function Listview({
  id,
  component,
  width,
  height,
  containerProps,
  removeComponent,
  properties,
  styles,
  fireEvent,
  setExposedVariable,
}) {
  const fallbackProperties = { height: 100, showBorder: false, data: [] };
  const fallbackStyles = { visibility: true, disabledState: false };

  const { data, rowHeight, showBorder } = { ...fallbackProperties, ...properties };
  const { backgroundColor, visibility, disabledState, borderRadius } = { ...fallbackStyles, ...styles };

  const { variablesExposedForPreview, exposeToCodeHinter } = useContext(EditorContext);

  const computedStyles = {
    backgroundColor,
    height,
    display: visibility ? 'flex' : 'none',
    borderRadius: borderRadius ?? 0,
  };

  const [selectedRowIndex, setSelectedRowIndex] = useState(undefined);
  function onRowClicked(index) {
    setSelectedRowIndex(index);
    setExposedVariable('selectedRowId', index);
    setExposedVariable('selectedRow', childrenData[index]);
    fireEvent('onRowClicked');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  const parentRef = useRef(null);

  const [childrenData, setChildrenData] = useState({});

  useEffect(() => {
    setExposedVariable('data', {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setExposedVariable('data', childrenData);
    if (selectedRowIndex != undefined) {
      setExposedVariable('selectedRowId', selectedRowIndex);
      setExposedVariable('selectedRow', childrenData[selectedRowIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenData]);

  useEffect(() => {
    if (!_.isArray(data) && !_.isEqual(variablesExposedForPreview[id]?.listItem, data)) {
      const customResolvables = {};
      customResolvables[id] = { listItem: data };
      exposeToCodeHinter((prevState) => ({ ...prevState, ...customResolvables }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  return (
    <div
      data-disabled={disabledState}
      className="jet-listview"
      id={id}
      ref={parentRef}
      onClick={() => containerProps.onComponentClick(id, component)}
      style={computedStyles}
    >
      <div className="rows w-100">
        {(_.isArray(data) ? data : []).map((listItem, index) => {
          if (index === 0 && !_.isEqual(variablesExposedForPreview[id]?.listItem, listItem)) {
            const customResolvables = {};
            customResolvables[id] = { listItem };
            exposeToCodeHinter((prevState) => ({ ...prevState, ...customResolvables }));
          }
          return (
            <div
              className={`list-item w-100 ${showBorder ? 'border-bottom' : ''}`}
              style={{ position: 'relative', height: `${rowHeight}px`, width: '100%' }}
              key={index}
              onClick={(event) => {
                event.stopPropagation();
                onRowClicked(index);
              }}
            >
              <SubContainer
                parentComponent={component}
                containerCanvasWidth={width}
                parent={`${id}`}
                parentName={component.name}
                {...containerProps}
                readOnly={index !== 0}
                customResolvables={{ listItem }}
                parentRef={parentRef}
                removeComponent={removeComponent}
                listViewItemOptions={{ index }}
                exposedVariables={childrenData[index]}
                onOptionChange={function ({ component, optionName, value }) {
                  setChildrenData((prevData) => {
                    const changedData = { [component.name]: { [optionName]: value } };
                    const existingDataAtIndex = prevData[index] ?? {};
                    const newDataAtIndex = {
                      ...prevData[index],
                      [component.name]: { ...existingDataAtIndex[component.name], ...changedData[component.name] },
                    };
                    const newChildrenData = { ...prevData, [index]: newDataAtIndex };
                    return { ...prevData, ...newChildrenData };
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
