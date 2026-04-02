import React, { useState } from "react";
import "./index.css";

const EmploymentType = ({ typeFilter }) => {
  const [selected, setSelected] = useState([]);

  const handleChange = (value) => {
    let updated;

    if (selected.includes(value)) {
      updated = selected.filter(item => item !== value);
    } else {
      updated = [...selected, value];
    }

    setSelected(updated);
    typeFilter(value); // send to parent
  };

  return (
    <div className="container">
      <h3>Type of Employment</h3>

      <label className="option">
        <input
          type="checkbox"
          value="FULLTIME"
          checked={selected.includes("FULLTIME")}
          onChange={() => handleChange("FULLTIME")}
        />
        Full Time
      </label>

      <label className="option">
        <input
          type="checkbox"
          value="PARTTIME"
          checked={selected.includes("PARTTIME")}
          onChange={() => handleChange("PARTTIME")}
        />
        Part Time
      </label>

      <label className="option">
        <input
          type="checkbox"
          value="FREELANCE"
          checked={selected.includes("FREELANCE")}
          onChange={() => handleChange("FREELANCE")}
        />
        Freelance
      </label>

      <label className="option">
        <input
          type="checkbox"
          value="INTERNSHIP"
          checked={selected.includes("INTERNSHIP")}
          onChange={() => handleChange("INTERNSHIP")}
        />
        Internship
      </label>
    </div>
  );
};

export default EmploymentType;