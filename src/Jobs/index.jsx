import {useEffect, useState} from 'react'
import Cookies from 'js-cookie'
import {BsSearch} from 'react-icons/bs'
import JobItem from '../JobItem'
import SalaryFilter from '../SalaryFilters'
import EmploymentType from '../EmploymentType'
import './index.css'
import Header from '../Header'

const Jobs = () => {
  const [jobsList, setJobsList] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [salary, setSalary] = useState('')
  const [employmentType, setEmploymentType] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const token = Cookies.get('jwt_token')

  // ✅ API CALL
  const getJobs = async () => {
    setIsLoading(true)

    const activeTypes = employmentType.join(',')

    const url = `http://localhost:3000/jobs?employment_type=${activeTypes}&minimum_package=${salary}&search=${searchInput}`

    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'GET',
    }

    try {
      const response = await fetch(url, options)

      if (response.ok) {
        const data = await response.json()

        const updatedData = data.map(each => ({
          id: each.id,
          title: each.title,
          location: each.location,
          employmentType: each.employment_type,
          packagePerAnnum: each.package_per_annum,
          rating: each.rating,
          companyLogoUrl: each.company_logo_url,
          jobDescription: each.job_description,
        }))
        console.log(updatedData)
        setJobsList(updatedData)
      } else {
        console.error('Failed to fetch jobs')
      }
    } catch (error) {
      console.error(error)
    }

    setIsLoading(false)
  }

  // ✅ FETCH WHEN FILTERS CHANGE
  useEffect(() => {
    if (token) {
      getJobs()
    }
  }, [token, salary, employmentType])

  // ✅ SEARCH
  const onClickSearch = () => getJobs()

  const onKeyDownSearch = event => {
    if (event.key === 'Enter') {
      getJobs()
    }
  }

  // ✅ FILTER HANDLERS
  const filterBySalary = value => setSalary(value)

  const typeFilter = value => {
    setEmploymentType(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }

  return (
    <div className="jobs-page-container">
      <Header/>
      <div className="jobs-content">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="profile-card">
            <img
              src="https://assets.ccbp.in/frontend/react-js/male-avatar-img.png"
              alt="profile"
              className="profile-img"
            />
            <h1 className="profile-name">Rahul Attuluri</h1>
            <p className="profile-bio">Lead Software Developer</p>
          </div>

          <hr className="separator" />

          <EmploymentType typeFilter={typeFilter} />

          <hr className="separator" />

          <SalaryFilter
            filterBySalary={filterBySalary}
            salary={salary}
          />
        </aside>

        {/* MAIN SECTION */}
        <main className="jobs-list-section">

          {/* SEARCH */}
          <div className="search-container">
            <input
              type="search"
              className="search-input"
              placeholder="Search"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={onKeyDownSearch}
            />

            <button
              type="button"
              className="search-button"
              onClick={onClickSearch}
              aria-label="search button"
            >
              <BsSearch className="search-icon" />
            </button>
          </div>

          {/* JOB LIST */}
          {isLoading ? (
            <p className="loading">Loading...</p>
          ) : (
            <ul className="jobs-list">
              {jobsList.length > 0 ? (
                jobsList.map(each => (
                  <JobItem key={each.id} jobDetails={each} />
                ))
              ) : (
                <div className="no-jobs-view">
                  <img
                    src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
                    alt="no jobs"
                  />
                  <h1>No Jobs Found</h1>
                  <p>We could not find any jobs. Try other filters.</p>
                </div>
              )}
            </ul>
          )}
        </main>
      </div>
    </div>
  )
}

export default Jobs