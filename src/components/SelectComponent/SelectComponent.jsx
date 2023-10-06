const SelectComponent = ({ dataName, dataValues }) => {
  const selectData = [{ label: "Select an option", value: "" }, ...dataValues];
  return (
    <select name={dataName} id={dataName}>
      {selectData.map(({ label, value }) => {
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
};

export default SelectComponent;
