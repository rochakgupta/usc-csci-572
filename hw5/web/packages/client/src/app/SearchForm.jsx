/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import QuerySuggestInput from "./QuerySuggestInput";
import QueryTypeRadioInput from "./QueryTypeRadioInput";

const SearchForm = ({
  query,
  queryType,
  onQueryChange,
  onQueryTypeSelect,
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
      <QuerySuggestInput width="200px" value={query} onChange={onQueryChange} />
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
          value: "lucene",
          label: "Lucene"
        },
        {
          value: "pagerank",
          label: "Page Rank"
        }
      ].map((QueryType, index) => (
        <div key={index}>
          <QueryTypeRadioInput
            {...QueryType}
            selectedValue={queryType}
            onSelect={onQueryTypeSelect}
          />
        </div>
      ))}
    </div>
    <div>
      <button onClick={onSearch} disabled={isSearchDisabled}>
        Submit
      </button>
    </div>
  </div>
);

export default SearchForm;
