import React from 'react';

function FreelancerDashboard({ services, currentAccount }) {
  const myServices = services.filter(service =>
    service.freelancer.toLowerCase() === currentAccount.toLowerCase()
  );

  const ratedServices = myServices.filter(s => s.serviceRating > 0);
  const totalRatings = ratedServices.length;
  const avgRating = totalRatings
    ? (ratedServices.reduce((sum, s) => sum + parseInt(s.serviceRating), 0) / totalRatings).toFixed(0)
    : null;

  if (myServices.length === 0) {
    return <div className="alert alert-info">You haven't created any services yet.</div>;
  }

  return (
    <div className="container mt-4">
      <p><strong>Average Rating:</strong> {avgRating ? `${avgRating}/5` : 'No ratings yet'}</p>
      <p><strong>Total Ratings Received:</strong> {totalRatings}</p>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Service</th>
              <th>Price (ETH)</th>
              <th>Status</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {myServices.map(service => (
              <tr key={service.id}>
                <td>{service.title}</td>
                <td>{service.price}</td>
                <td>
                {service.isPaid ? (
                    <span className="badge2 badge-success">Payment Received</span>
                  ) : service.isActive && service.deadline >= Math.floor(Date.now() / 1000)? (
                    <span className="badge2 badge-warning">Active</span>
                  ) : service.isActive && service.deadline < Math.floor(Date.now() / 1000)?(
                    <span className="badge2 badge-warning">Expired</span>
                  ) : (
                    <span className="badge2 badge-danger">Refunded</span>
                  )}
                </td>
                <td>
                  {service.serviceRating > 0
                    ? `${service.serviceRating}/5`
                    : 'Not Rated'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FreelancerDashboard;
