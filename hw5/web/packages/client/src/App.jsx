/** @jsxRuntime classic */
/** @jsx jsx */

import { css, jsx } from "@emotion/react";
import React, { useReducer } from "react";
import { Api, ApiStatus } from "./api";
import {
  Message,
  QuerySuggestInput,
  QueryTypeRadioInput,
  SearchResult
} from "./components";

const initialState = {
  query: "",
  queryType: null,
  searchStatus: ApiStatus.INITIAL,
  searchResult: null,
  searchError: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "QUERY_CHANGE":
      return {
        ...state,
        query: action.query
      };
    case "QUERY_TYPE_SELECT":
      return {
        ...state,
        queryType: action.queryType
      };
    case "SEARCH_START":
      return {
        ...state,
        searchStatus: ApiStatus.LOADING
      };
    case "SEARCH_SUCCESS":
      return {
        ...state,
        searchStatus: ApiStatus.SUCCESS,
        searchResult: action.searchResult
      };
    case "SEARCH_ERROR":
      return {
        ...state,
        searchStatus: ApiStatus.ERROR,
        searchError: action.searchError
      };
    default:
      throw new Error("Invalid action type");
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { query, queryType, searchStatus, searchResult, searchError } = state;

  const handleQueryChange = (newQuery) => {
    dispatch({
      type: "QUERY_CHANGE",
      query: newQuery
    });
  };

  const handleQueryTypeSelect = (newQueryType) => {
    dispatch({
      type: "QUERY_TYPE_SELECT",
      queryType: newQueryType
    });
  };

  const handleSubmit = async () => {
    dispatch({
      type: "SEARCH_START"
    });
    try {
      const result = await Api.search(query, queryType);
      dispatch({
        type: "SEARCH_SUCCESS",
        searchResult: result
      });
    } catch (error) {
      dispatch({
        type: "SEARCH_ERROR",
        searchError: error.message
      });
    }
  };

  const isSubmitDisabled = !(query && query.length > 0 && queryType);

  return (
    <React.Fragment>
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
        <div>Search</div>
        <QuerySuggestInput
          width="200px"
          value={query}
          onChange={handleQueryChange}
        />
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
              onSelect={handleQueryTypeSelect}
              marginLeft={index > 0}
            />
          ))}
        </div>
        <button onClick={handleSubmit} disabled={isSubmitDisabled}>
          Submit
        </button>
      </div>
      {searchStatus === ApiStatus.ERROR && <Message text={searchError} />}
      {searchStatus === ApiStatus.SUCCESS && <SearchResult {...searchResult} />}
    </React.Fragment>
  );
};

export default App;
