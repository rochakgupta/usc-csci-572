/** @jsxRuntime classic */
/** @jsx jsx */

import { css, jsx } from "@emotion/react";

const SearchResult = ({ start, end, total, documents }) => {
  const Document = ({ id, url, title, description }) => {
    const Link = ({ text }) => (
      <a target="_blank" rel="noreferrer" href={url}>
        {text}
      </a>
    );

    return (
      <div
        css={css`
          margin-left: 20px;
        `}
      >
        <div>
          Title: <Link text={title} />
        </div>
        <div>
          URL: <Link text={url} />
        </div>
        <div>ID: {id}</div>
        <div>Description: {description}</div>
      </div>
    );
  };

  return (
    <div
      css={css`
        & > div {
          margin-top: 20px;
        }
      `}
    >
      <div>
        Results {start} - {end} of {total}:
      </div>
      {documents.map((document, index) => (
        <Document key={index} {...document} />
      ))}
    </div>
  );
};

export default SearchResult;
