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
  const Query = ({ query }) => (
    <span
      css={css`
        font-style: italic;
      `}
    >
      {query}
    </span>
  );

  const AlternateQuery = () => {
    const handleClick = () => {
      onAlternateSearch(alternate);
    };

    return (
      <span
        css={css`
          color: blue;
          text-decoration: underline;
          cursor: pointer;
        `}
        onClick={handleClick}
      >
        <Query query={alternate} />
      </span>
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
      `}
    >
      {alternate && (
        <div>
          {total === 0 && (
            <span
              css={css`
                margin-right: 5px;
              `}
            >
              Found 0 results for <Query query={query} />.
            </span>
          )}
          <span>
            Did you mean <AlternateQuery />?
          </span>
        </div>
      )}
      {total > 0 && (
        <div>
          Results {start} - {end} of {total} for <Query query={query} />:
        </div>
      )}
      {documents.map((document, index) => (
        <div
          key={index}
          css={css`
            margin-left: 20px;
          `}
        >
          <Document {...document} />
        </div>
      ))}
    </div>
  );
};

export default SearchResult;
