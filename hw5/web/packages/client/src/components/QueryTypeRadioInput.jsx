/** @jsxRuntime classic */
/** @jsx jsx */

import { css, jsx } from "@emotion/react";

const QueryTypeRadioInput = ({
  value,
  label,
  selectedValue,
  onSelect,
  marginLeft
}) => (
  <span
    {...(marginLeft && {
      css: css`
        margin-left: 10px;
      `
    })}
  >
    <input
      type="radio"
      id="radio"
      name="radio"
      value={value}
      checked={selectedValue === value}
      onChange={(e) => onSelect(e.target.value)}
    />
    <label htmlFor="radio">{label}</label>
  </span>
);

export default QueryTypeRadioInput;
