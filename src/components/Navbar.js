import React from 'react';

function Navbar({ accounts, setActiveTab, isFreelancer, toggleUserType, activeTab }) {
  const shortAddress = accounts.length > 0 ? 
    `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}` : 
    'Not Connected';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <a className="navbar-brand" href="#!">
          <img src="Logo.png" alt="Logo" className="Logo" /> Smart Contractors
        </a>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto">
          {isFreelancer && (
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${activeTab === 'myServices' ? 'active-tab': ''}`} 
                  onClick={() => setActiveTab('myServices')}
                >
                  My Services
                </button>
              </li>
            )}
            
            {isFreelancer && (
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${activeTab === 'Marketplacef' ? 'active-tab' : ''}`} 
                  onClick={() => setActiveTab('Marketplacef')}
                >
                  Marketplace
                </button>
              </li>
            )}

            {isFreelancer && (
                <li className="nav-item">
                  <button 
                    className={`nav-link btn btn-link ${activeTab === 'offerService' ? 'active-tab' : ''}`} 
                    onClick={() => setActiveTab('offerService')}
                  >
                    Offer Service
                  </button>
                </li>
            )}

            {!isFreelancer && (
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${activeTab === 'clientDashboard' ? 'active-tab' : ''}`} 
                  onClick={() => setActiveTab('clientDashboard')}
                >
                  My Hired Services
                </button>
              </li>
            )}

            {!isFreelancer && (
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${activeTab === 'marketplace' ? 'active-tab' : ''}`} 
                  onClick={() => setActiveTab('marketplace')}
                >
                  Marketplace
                </button>
              </li>
            )}
          </ul>

          <div className="navbar-text mr-3">
            <button className="btn btn-sm btn-outline-dark switch" onClick={toggleUserType}>
              Switch to {isFreelancer ? 'Client' : 'Freelancer'} Mode
            </button>
          </div>

          <div className="navbar-text account-id">
            <span className="badge">Account ID: {shortAddress}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;