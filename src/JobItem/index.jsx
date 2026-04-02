import "./index.css"
import { Link } from "react-router-dom"

const JobItem = ({ jobDetails }) => {
  const {
    id,
    title,
    location,
    employmentType,
    packagePerAnnum,
    rating,
    companyLogoUrl,
  } = jobDetails

  return (
    <Link to={`/jobs/${id}`} className="link-item">
      <div className="job-card">
        {/* Top Section */}
        <div className="job-header">
          <img
            src={companyLogoUrl}
            alt="company logo"
            className="company-logo"
          />
          <div>
            <h3 className="job-title">{title}</h3>
            <p className="rating">⭐ {rating}</p>
          </div>
        </div>

        {/* Middle Section */}
        <div className="job-details">
          <p>📍 {location}</p>
          <p>💼 {employmentType}</p>
          <p className="package">{packagePerAnnum}</p>
        </div>

        <hr />

        {/* Bottom Section */}
        <p className="description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a sample job description.
        </p>
      </div>
    </Link>
  )
}

export default JobItem