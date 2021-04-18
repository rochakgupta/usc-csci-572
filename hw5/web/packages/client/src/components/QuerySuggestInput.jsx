import { useState } from "react";
import AsyncSelect from "react-select/async";
import { Api } from "../api";

const stylesOptions = {
  menu: (base, { selectProps: { width } }) => ({
    ...base,
    width
  }),
  container: (base, { selectProps: { width } }) => ({
    ...base,
    width
  }),
  dropdownIndicator: () => ({
    display: "none"
  }),
  indicatorSeparator: () => ({
    display: "none"
  }),
  placeholder: () => ({
    display: "none"
  })
};

const buildOption = (suggestion) => ({
  value: suggestion,
  label: suggestion
});

const loadOptions = async (inputValue) => {
  try {
    const suggestions = await Api.suggest(inputValue);
    return suggestions.map((suggestion) => buildOption(suggestion));
  } catch (error) {
    console.log(error);
    return [];
  }
};

const QuerySuggestInput = ({
  width = "200px",
  value: inputValue,
  onChange: onInputChange
}) => {
  const [value, setValue] = useState(buildOption(inputValue));

  const handleInputChange = (inputValue, { action }) => {
    if (action === "input-change") {
      setValue(buildOption(inputValue));
      onInputChange(inputValue);
    }
  };

  const handleOptionSelect = (value, { action }) => {
    setValue(value);
    if (action === "clear") {
      onInputChange("");
    } else {
      onInputChange(value.value);
    }
  };

  return (
    <AsyncSelect
      width={width}
      value={value}
      styles={stylesOptions}
      loadOptions={loadOptions}
      onInputChange={handleInputChange}
      onChange={handleOptionSelect}
      closeMenuOnSelect={true}
      isClearable
      autoFocus={false}
    />
  );
};

export default QuerySuggestInput;
