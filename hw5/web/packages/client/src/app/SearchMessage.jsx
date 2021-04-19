/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";

const SearchMessage = ({ text }) => (
  <div
    css={css`
      margin-top: 20px;
    `}
  >
    {text}
  </div>
);

export default SearchMessage;
