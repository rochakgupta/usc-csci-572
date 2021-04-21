/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { useReducer } from "react";
import { Api, ApiStatus } from "./Api";
import SearchForm from "./SearchForm";
import SearchResult from "./SearchResult";

const initialState = {
  query: "",
  searchType: null,
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
    case "SEARCH_TYPE_SELECT":
      return {
        ...state,
        searchType: action.searchType
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
  const { query, searchType, searchStatus, searchResult, searchError } = state;

  const handleQueryChange = (query) => {
    dispatch({
      type: "QUERY_CHANGE",
      query
    });
  };

  const handleSearchTypeSelect = (searchType) => {
    dispatch({
      type: "SEARCH_TYPE_SELECT",
      searchType
    });
  };

  const search = async (q = query) => {
    dispatch({
      type: "SEARCH_START"
    });
    try {
      const searchResult = await Api.search(q, searchType);
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

  const handleSearch = async () => {
    await search();
  };

  const handleAlternateSearch = async (alternate) => {
    await search(alternate);
  };

  const isSearchFormValid = query && query.length > 0 && searchType;

  const isSearchDisabled = !isSearchFormValid || searchStatus === ApiStatus.LOADING;

  return (
    <div
      css={css`
        & > div {
          margin-bottom: 20px;
        }
      `}
    >
      <div>
        <SearchForm
          query={query}
          searchType={searchType}
          onQueryChange={handleQueryChange}
          onSearchTypeSelect={handleSearchTypeSelect}
          isSearchDisabled={isSearchDisabled}
          onSearch={handleSearch}
        />
      </div>
      {searchStatus === ApiStatus.LOADING && <div>Searching...</div>}
      {searchStatus === ApiStatus.ERROR && <div>{searchError}</div>}
      {searchStatus === ApiStatus.SUCCESS && (
        <div>
          <SearchResult {...searchResult} onAlternateSearch={handleAlternateSearch} />
        </div>
      )}
    </div>
  );
};

export default App;
