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
      & > * {
        margin-top: 20px;
      }
    `}
  >
    <div>Enhanced Search</div>
    <QuerySuggestInput width="200px" value={query} onChange={onQueryChange} />
    <div
      css={css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
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
        <QueryTypeRadioInput
          key={index}
          {...QueryType}
          selectedValue={queryType}
          onSelect={onQueryTypeSelect}
          marginLeft={index > 0}
        />
      ))}
    </div>
    <button onClick={onSearch} disabled={isSearchDisabled}>
      Submit
    </button>
  </div>
);

export default SearchForm;
