/** @jsxRuntime classic */
/** @jsx jsx */

import { css, jsx } from "@emotion/react";

const SearchError = ({ text }) => (
  <div
    css={css`
      margin-top: 20px;
    `}
  >
    {text}
  </div>
);

export default SearchError;
