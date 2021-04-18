/** @jsxRuntime classic */
/** @jsx jsx */

import { css, jsx } from "@emotion/react";

const Message = ({ text }) => (
  <div
    css={css`
      margin-top: 20px;
    `}
  >
    {text}
  </div>
);

export default Message;
