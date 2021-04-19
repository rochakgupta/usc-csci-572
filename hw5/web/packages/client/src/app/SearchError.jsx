/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";

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
