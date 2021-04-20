/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import QuerySuggestInput from "./QuerySuggestInput";
import SearchTypeRadioInput from "./SearchTypeRadioInput";

const SearchForm = ({
  query,
  searchType,
  onQueryChange,
  onSearchTypeSelect,
  isSearchDisabled,
  onSearch
}) => (
  <div
    css={css`
      display: flex;
      flex-direction: column;
      align-items: center;
      & > div:first-of-type {
        margin-top: 20px;
      }
      & > div:not(:last-of-type) {
        margin-bottom: 20px;
      }
    `}
  >
    <div>Enhanced Search</div>
    <div>
      <QuerySuggestInput width="300px" value={query} onChange={onQueryChange} />
    </div>
    <div
      css={css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        & > div:not(:last-of-type) {
          margin-right: 20px;
        }
      `}
    >
      {[
        {
          type: "lucene",
          label: "Lucene"
        },
        {
          type: "pagerank",
          label: "Page Rank"
        }
      ].map((SearchType, index) => (
        <div key={index}>
          <SearchTypeRadioInput
            {...SearchType}
            selectedType={searchType}
            onSelect={onSearchTypeSelect}
          />
        </div>
      ))}
    </div>
    <div>
      <button onClick={onSearch} disabled={isSearchDisabled}>
        Search
      </button>
    </div>
  </div>
);

export default SearchForm;
