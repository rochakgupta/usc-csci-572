import React, { useReducer } from "react";
import { Api, ApiStatus } from "./Api";
import SearchForm from "./SearchForm";
import SearchMessage from "./SearchMessage";
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
        searchResult: action.searchResult,
        searchError: null
      };
    case "SEARCH_ERROR":
      return {
        ...state,
        searchStatus: ApiStatus.ERROR,
        searchResult: null,
        searchError: action.searchError
      };
    default:
      throw new Error("Invalid action type");
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { query, queryType, searchStatus, searchResult, searchError } = state;

  const handleQueryChange = (query) => {
    dispatch({
      type: "QUERY_CHANGE",
      query
    });
  };

  const handleQueryTypeSelect = (queryType) => {
    dispatch({
      type: "QUERY_TYPE_SELECT",
      queryType
    });
  };

  const search = async (q = query) => {
    dispatch({
      type: "SEARCH_START"
    });
    try {
      const searchResult = await Api.search(q, queryType);
      dispatch({
        type: "SEARCH_SUCCESS",
        searchResult
      });
    } catch (error) {
      dispatch({
        type: "SEARCH_ERROR",
        searchError: error.message
      });
    }
  };

  const handleSearch = async () => await search();

  const handleAlternateSearch = async (alternate) => await search(alternate);

  const isSearchDisabled = !(query && query.length > 0 && queryType);

  return (
    <React.Fragment>
      <SearchForm
        query={query}
        queryType={queryType}
        onQueryChange={handleQueryChange}
        onQueryTypeSelect={handleQueryTypeSelect}
        isSearchDisabled={isSearchDisabled}
        onSearch={handleSearch}
      />
      {searchStatus === ApiStatus.LOADING && (
        <SearchMessage text="Searching..." />
      )}
      {searchStatus === ApiStatus.ERROR && <SearchMessage text={searchError} />}
      {searchStatus === ApiStatus.SUCCESS && (
        <SearchResult
          {...searchResult}
          onAlternateSearch={handleAlternateSearch}
        />
      )}
    </React.Fragment>
  );
};

export default App;
