import React from 'react';

function ServiceList({ services, currentAccount, hireFreelancer, isFreelancer, activeTab }) {
  const availableServices = services.filter(service => 
    service.isActive && 
    service.client === '0x0000000000000000000000000000000000000000'
  );

  const filteredServices = !isFreelancer 
    ? availableServices.filter(service => service.freelancer.toLowerCase() !== currentAccount.toLowerCase() && (service.deadline >= Math.floor(Date.now() / 1000)))
    : availableServices.filter(service => service.deadline >= Math.floor(Date.now() / 1000));

  if (filteredServices.length === 0) {
    return <div className="alert alert-info">No services available at the moment.</div>;
  }

  return (
    <div className="row">
      {filteredServices.map(service => (
        <div key={service.id} className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">{service.title}</h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                <strong>Price:</strong> {service.price} ETH
              </p>
              <p className="card-text">
                <strong>Description:</strong> {service.description}
              </p>
              <p className="card-text text-truncate">
                 <strong> Freelancer: </strong> {service.freelancer.substring(0, 6)}...{service.freelancer.substring(service.freelancer.length - 4)}
              </p>
              <p className="card-text">
              <strong> Avg. Rating: </strong> {parseInt(service.avgRating) > 0 ? `${service.avgRating}/5` : 'No ratings yet'}
              </p>
              <p className="card-text">
                <strong> Number of reviews: </strong> {parseInt(service.ratingCount) > 0 ? `${service.ratingCount}`: 0}
              </p>
              <p className="card-text">
                <strong> Available for (days): </strong> {`${Math.ceil((service.deadline - Math.floor(Date.now() / 1000)) / (24* 3600))}`}
              </p>
            </div>
            <div className="card-footer">
            {!isFreelancer && activeTab === 'marketplace' && (
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => hireFreelancer(service.id, service.price)}
                >
                  Hire Freelancer
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ServiceList;
