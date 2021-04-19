import { useReducer } from "react";
import AsyncSelect from "react-select/async";
import { Api, ApiStatus } from "./Api";

const widthFromProp = (base, { selectProps: { width } }) => ({
  ...base,
  width
});

const displayNone = (base) => ({
  ...base,
  display: "none"
});

const stylesOptions = {
  menu: widthFromProp,
  container: widthFromProp,
  dropdownIndicator: displayNone,
  indicatorSeparator: displayNone,
  placeholder: displayNone
};

const buildOption = (suggestion) => ({
  value: suggestion,
  label: suggestion
});

const buildInitialState = (value) => ({
  value,
  suggestStatus: ApiStatus.INITIAL,
  suggestError: null
});

const reducer = (state, action) => {
  switch (action.type) {
    case "VALUE_CHANGE":
      return {
        ...state,
        value: action.value
      };
    case "SUGGEST_START":
      return {
        ...state,
        suggestStatus: ApiStatus.LOADING
      };
    case "SUGGEST_SUCCESS":
      return {
        ...state,
        suggestStatus: ApiStatus.SUCCESS,
        suggestError: null
      };
    case "SUGGEST_ERROR":
      return {
        ...state,
        suggestStatus: ApiStatus.ERROR,
        suggestError: action.suggestError
      };
    default:
      throw new Error("Invalid action type");
  }
};

const QuerySuggestInput = ({
  width,
  value: inputValue,
  onChange: onInputChange
}) => {
  const [state, dispatch] = useReducer(reducer, buildInitialState(inputValue));
  const { value, suggestStatus, suggestError } = state;

  const loadOptions = async (inputValue) => {
    dispatch({
      type: "SUGGEST_START"
    });
    try {
      const suggestions = await Api.suggest(inputValue);
      dispatch({
        type: "SUGGEST_SUCCESS"
      });
      return suggestions.map((suggestion) => buildOption(suggestion));
    } catch (error) {
      console.log(error);
      dispatch({
        type: "SUGGEST_ERROR",
        suggestError: error.message
      });
      return [];
    }
  };

  const handleInputChange = (inputValue, { action }) => {
    if (action === "input-change") {
      dispatch({
        type: "VALUE_CHANGE",
        value: buildOption(inputValue)
      });
      onInputChange(inputValue);
    }
  };

  const handleOptionSelect = (value, { action }) => {
    dispatch({
      type: "VALUE_CHANGE",
      value
    });
    if (action === "clear") {
      onInputChange("");
    } else {
      onInputChange(value.value);
    }
  };

  const noOptionsMessage = () => {
    if (suggestStatus === ApiStatus.ERROR) {
      return suggestError;
    }
    return "No Suggestions";
  };

  return (
    <AsyncSelect
      width={width}
      value={value}
      styles={stylesOptions}
      loadOptions={loadOptions}
      noOptionsMessage={noOptionsMessage}
      onInputChange={handleInputChange}
      onChange={handleOptionSelect}
      closeMenuOnSelect={true}
      isClearable
      autoFocus={false}
    />
  );
};

export default QuerySuggestInput;
