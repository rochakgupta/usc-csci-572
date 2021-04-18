/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from "@emotion/react";
import React, { useReducer } from "react";
import { Api, ApiStatus } from "./Api";
import SearchError from "./SearchError";
import SearchForm from "./SearchForm";
import SearchResult from "./SearchResult";

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
      <SearchForm
        query={query}
        queryType={queryType}
        onQueryChange={handleQueryChange}
        onQueryTypeSelect={handleQueryTypeSelect}
        isSubmitDisabled={isSubmitDisabled}
        onSubmit={handleSubmit}
      />
      {searchStatus === ApiStatus.ERROR && <SearchError text={searchError} />}
      {searchStatus === ApiStatus.SUCCESS && <SearchResult {...searchResult} />}
    </React.Fragment>
  );
};

export default App;
