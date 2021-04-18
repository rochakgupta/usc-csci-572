const TextInput = ({ value, onChange }) => (
  <span>
    <input
      id="input"
      type="text"
      name="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </span>
);

export default TextInput;
