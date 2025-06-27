import React, { useState } from 'react';

function ServiceForm({ createService }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !price || !deadlineDays) return;

    createService(title, description, price, deadlineDays);
    setTitle('');
    setDescription('');
    setPrice('');
    setDeadlineDays('');
  };

  return (
    <div className="card service-card w-100">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Service Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Web Development"
              maxLength={50}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Service Description</label>
            <input
              type="text"
              className="form-control"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Create a personalized website."
              maxLength={200}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price (ETH)</label>
            <input
              type="number"
              className="form-control"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 0.0001"
              step="0.0001"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deadline">Service Availability (days from creation)</label>
            <input
              type="number"
              className="form-control"
              id="deadline"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
              placeholder="e.g., 14"
              min="1"
              max="180"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Create Service</button>
        </form>
      </div>
    </div>
  );
}

export default ServiceForm;
