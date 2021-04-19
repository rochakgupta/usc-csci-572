/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";

const SearchResult = ({
  query,
  start,
  end,
  total,
  documents,
  alternate,
  onAlternateSearch
}) => {
  const Alternate = () => {
    const handleClick = () => {
      onAlternateSearch(alternate);
    };

    return (
      <i
        css={css`
          color: blue;
          text-decoration: underline;
          cursor: pointer;
        `}
        onClick={handleClick}
      >
        {alternate}
      </i>
    );
  };

  const Document = ({ id, url, title, description }) => {
    const Link = ({ text }) => (
      <a target="_blank" rel="noreferrer" href={url}>
        {text}
      </a>
    );

    return (
      <div>
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
          margin-bottom: 20px;
        }
        & > div:not(:first-of-type) {
          margin-left: 20px;
        }
      `}
    >
      {!alternate && (
        <div>
          Results {start} - {end} of {total}:
        </div>
      )}
      {alternate && (
        <div>
          Found 0 results for <i>{query}</i>. Did you mean <Alternate />?
        </div>
      )}
      {documents.map((document, index) => (
        <div key={index}>
          <Document {...document} />
        </div>
      ))}
    </div>
  );
};

export default SearchResult;
