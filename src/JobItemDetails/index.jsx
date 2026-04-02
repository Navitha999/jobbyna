import {useState, useEffect} from 'react'
import Cookies from 'js-cookie'
import {useParams} from 'react-router-dom'
import {MdLocationOn} from 'react-icons/md'
import {BsBriefcaseFill} from 'react-icons/bs'
import {FiExternalLink} from 'react-icons/fi'
import Header from '../Header'
import './index.css'

const JobItemDetails = () => {
  const {id} = useParams()

  const [jobData, setJobData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const getJobData = async () => {
      try {
        const url = `https://apis.ccbp.in/jobs/${id}`
        const token = Cookies.get('jwt_token')

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch')
        }

        const data = await response.json()

        const updatedData = {
          companyLogoUrl: data.job_details.company_logo_url,
          companyWebsiteUrl: data.job_details.company_website_url,
          employmentType: data.job_details.employment_type,
          id: data.job_details.id,
          jobDescription: data.job_details.job_description,
          location: data.job_details.location,
          packagePerAnnum: data.job_details.package_per_annum,
          title: data.job_details.title,
          rating: data.job_details.rating,
          lifeAtCompany: {
            description: data.job_details.life_at_company.description,
            imageUrl: data.job_details.life_at_company.image_url,
          },
          skills: data.job_details.skills.map(eachSkill => ({
            name: eachSkill.name,
            imageUrl: eachSkill.image_url,
          })),
        }

        setJobData(updatedData)
      } catch (error) {
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    getJobData()
  }, [id])

  const renderLoadingView = () => (
    <div className="loader-container">
      <p>Loading...</p>
    </div>
  )

  const renderErrorView = () => (
    <div className="error-container">
      <p>Something went wrong. Please try again.</p>
    </div>
  )

  const renderJobDetailsView = () => {
    if (!jobData) return null

    const {
      companyLogoUrl,
      companyWebsiteUrl,
      employmentType,
      jobDescription,
      location,
      packagePerAnnum,
      title,
      rating,
      lifeAtCompany,
      skills,
    } = jobData

    return (
      <div className="job-details-content">
       
           <Header/>
        <div className="job-card">
          <div className="logo-title-container">
            <img
              src={companyLogoUrl}
              alt={`${title} company logo`}
              className="company-logo"
            />
            <div className="title-rating-container">
              <h1 className="job-title">{title}</h1>
              <div className="rating-container">
                <span className="star-icon">★</span>
                <p className="rating-text">{rating}</p>
              </div>
            </div>
          </div>

          {/* Location and Salary */}
          <div className="location-package-container">
            <div className="location-type">
              <div className="icon-item">
                <MdLocationOn className="icon" />
                <p>{location}</p>
              </div>
              <div className="icon-item">
                <BsBriefcaseFill className="icon" />
                <p>{employmentType}</p>
              </div>
            </div>
            <p className="package-text">{packagePerAnnum}</p>
          </div>

          <hr className="separator" />

          {/* Description */}
          <div className="description-header">
            <h1 className="section-heading">Description</h1>
            <a
              href={companyWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="visit-link"
            >
              Visit <FiExternalLink className="link-icon" />
            </a>
          </div>
          <p className="description-text">{jobDescription}</p>

          {/* Skills */}
          <h1 className="section-heading">Skills</h1>
          <ul className="skills-list">
            {skills.map(skill => (
              <li key={skill.name} className="skill-item">
                <img
                  src={skill.imageUrl}
                  alt={skill.name}
                  className="skill-image"
                />
                <p className="skill-name">{skill.name}</p>
              </li>
            ))}
          </ul>

          {/* Life at Company */}
          <h1 className="section-heading">Life at Company</h1>
          <div className="life-at-company-container">
            <p className="life-description">
              {lifeAtCompany.description}
            </p>
            <img
              src={lifeAtCompany.imageUrl}
              alt="life at company"
              className="life-image"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="job-item-details-container">
      {isLoading
        ? renderLoadingView()
        : hasError
        ? renderErrorView()
        : renderJobDetailsView()}
    </div>
  )
}

export default JobItemDetails