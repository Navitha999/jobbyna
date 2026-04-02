import "./index.css";

const SalaryFilter = ({ filterBySalary, salary }) => {
  const handleChange = (value) => {
    filterBySalary(value);
  };

  return (
    <div className="salary-container">
      <div className="title">Salary Range</div>

      <label>
        <input
          type="radio"
          name="salary"
          value="1000000"
          checked={salary === "1000000"}
          onChange={() => handleChange("1000000")}
        />
        10 LPA and above
      </label>

      <label>
        <input
          type="radio"
          name="salary"
          value="2000000"
          checked={salary === "2000000"}
          onChange={() => handleChange("2000000")}
        />
        20 LPA and above
      </label>

      <label>
        <input
          type="radio"
          name="salary"
          value="3000000"
          checked={salary === "3000000"}
          onChange={() => handleChange("3000000")}
        />
        30 LPA and above
      </label>

      <label>
        <input
          type="radio"
          name="salary"
          value="4000000"
          checked={salary === "4000000"}
          onChange={() => handleChange("4000000")}
        />
        40 LPA and above
      </label>
    </div>
  );
};

export default SalaryFilter;