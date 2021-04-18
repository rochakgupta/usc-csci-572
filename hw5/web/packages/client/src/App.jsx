/** @jsxRuntime classic */
/** @jsx jsx */

import { css, jsx } from '@emotion/react';
import React from 'react';
import * as Api from './api';

const TextInput = ({ value, onChange }) => (
  <span>
    <input
      css={css`
        margin-left: 10px;
      `}
      id='input'
      type='text'
      name='input'
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </span>
);

const RadioInput = ({ value, label, selectedValue, onSelect, marginLeft }) => (
  <span
    {...(marginLeft && {
      css: css`
        margin-left: 10px;
      `,
    })}
  >
    <input
      type='radio'
      id='radio'
      name='radio'
      value={value}
      checked={selectedValue === value}
      onChange={(e) => onSelect(e.target.value)}
    />
    <label htmlFor='radio'>{label}</label>
  </span>
);

const SearchResult = ({ start, end, total, documents }) => {
  const Document = ({ id, url, title, description }) => {
    const Link = ({ text }) => (
      <a target='_blank' rel='noreferrer' href={url}>
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
    <>
      <div>
        Results {start} - {end} of {total}:
      </div>
      {documents.map((document, index) => (
        <Document key={index} {...document} />
      ))}
    </>
  );
};

const ApiStatus = {
  INITIAL: 'INITIAL',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const initialState = {
  query: '',
  queryType: null,
  searchStatus: ApiStatus.INITIAL,
  searchResults: null,
  searchError: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'QUERY_CHANGE':
      return {
        ...state,
        query: action.query,
      };
    case 'QUERY_TYPE_SELECT':
      return {
        ...state,
        queryType: action.queryType,
      };
    case 'SEARCH_START':
      return {
        ...state,
        searchStatus: ApiStatus.LOADING,
      };
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        searchStatus: ApiStatus.SUCCESS,
        searchResults: action.searchResults,
      };
    case 'SEARCH_ERROR':
      return {
        ...state,
        searchStatus: ApiStatus.ERROR,
        searchError: action.searchError,
      };
    default:
      throw new Error('Invalid action type');
  }
};

const App = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { query, queryType, searchStatus, searchResults, searchError } = state;

  const handleQueryChange = (newQuery) => {
    dispatch({
      type: 'QUERY_CHANGE',
      query: newQuery,
    });
  };

  const handleQueryTypeSelect = (newQueryType) => {
    dispatch({
      type: 'QUERY_TYPE_SELECT',
      queryType: newQueryType,
    });
  };

  const handleSubmit = async () => {
    if (query.length > 0 && queryType) {
      dispatch({
        type: 'SEARCH_START',
      });
      try {
        const results = await Api.search(query, queryType);
        dispatch({
          type: 'SEARCH_SUCCESS',
          searchResults: results,
        });
      } catch (error) {
        dispatch({
          type: 'SEARCH_ERROR',
          searchError: error.message,
        });
      }
    }
  };

  return (
    <>
      <div
        css={css`
          display: flex;
          flex-direction: column;
          justify-items: center;
          align-items: center;
          & > * {
            display: block;
            margin-top: 20px;
          }
        `}
      >
        <div>Search</div>
        <TextInput value={query} onChange={handleQueryChange} />
        <div
          css={css`
            display: flex;
            flex-direction: row;
            justify-content: space-between;
          `}
        >
          {[
            {
              value: 'lucene',
              label: 'Lucene',
            },
            {
              value: 'pagerank',
              label: 'Page Rank',
            },
          ].map((QueryType, index) => (
            <RadioInput
              key={index}
              {...QueryType}
              selectedValue={queryType}
              onSelect={handleQueryTypeSelect}
              marginLeft={index > 0}
            />
          ))}
        </div>
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <div
        css={css`
          & > div {
            margin-top: 20px;
          }
          & > div:not(:first-of-type) {
            margin-left: 20px;
          }
        `}
      >
        {searchStatus === ApiStatus.ERROR && searchError}
        {searchStatus === ApiStatus.SUCCESS && (
          <SearchResult {...searchResults} />
        )}
      </div>
    </>
  );
};

export default App;
