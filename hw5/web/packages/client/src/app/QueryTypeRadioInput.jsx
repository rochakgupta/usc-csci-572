const QueryTypeRadioInput = ({ value, label, selectedValue, onSelect }) => {
  const handleChange = (e) => {
    onSelect(e.target.value);
  };

  return (
    <span>
      <input
        type="radio"
        id="radio"
        name="radio"
        value={value}
        checked={selectedValue === value}
        onChange={handleChange}
      />
      <label htmlFor="radio">{label}</label>
    </span>
  );
};

export default QueryTypeRadioInput;
