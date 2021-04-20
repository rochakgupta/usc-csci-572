const SearchTypeRadioInput = ({ type, label, selectedType, onSelect }) => {
  const handleChange = (e) => {
    onSelect(e.target.value);
  };

  return (
    <span>
      <input
        type="radio"
        id="radio"
        name="radio"
        value={type}
        checked={selectedType === type}
        onChange={handleChange}
      />
      <label htmlFor="radio">{label}</label>
    </span>
  );
};

export default SearchTypeRadioInput;
