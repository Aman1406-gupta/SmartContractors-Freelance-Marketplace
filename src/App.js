import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import FreelanceMarketplaceABI from './contracts/FreelanceMarketplace.json';
import './App.css';
import ServiceList from './components/ServiceList';
import ServiceForm from './components/ServiceForm';
import Navbar from './components/Navbar';
import ClientDashboard from './components/ClientDashboard';
import FreelancerDashboard from './components/FreelancerDashboard';
import Loading from './components/Loading';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientServices, setClientServices] = useState([]);
  const [isFreelancer, setIsFreelancer] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible] = useState(true);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (success || error) {
      setVisible(true);
      const fadeTimeout = setTimeout(() => setVisible(false), 4000);
      const clearMessagesTimeout = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(clearMessagesTimeout);
      };
    }
  }, [success, error]);

  useEffect(() => {
    const init = async () => {
      try {
        let web3Instance;
        if (window.ethereum) {
          web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else if (window.web3) {
          web3Instance = new Web3(window.web3.currentProvider);
        } else {
          setTimeout(() => {
            setError('No Ethereum browser extension detected. Please install MetaMask.');
            setLoading(false);
          }, 2750);
          return;
        }

        const accounts = await web3Instance.eth.getAccounts();

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = FreelanceMarketplaceABI.networks[networkId];

        if (!deployedNetwork) {
          setTimeout(() => {
            setError('Contract not deployed on the detected network. Please switch to the correct network.');
            setLoading(false);
          }, 2500);
          return;
        }

        const contractInstance = new web3Instance.eth.Contract(
          FreelanceMarketplaceABI.abi,
          deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccounts(accounts);
        setContract(contractInstance);

        window.ethereum.on('accountsChanged', async (newAccounts) => {
          setAccounts(newAccounts);
          await loadServices(web3Instance, contractInstance, newAccounts[0]);
        });

        await loadServices(web3Instance, contractInstance, accounts[0]);
        setLoading(false);
      } catch (error) {
        console.error("Could not connect to contract or blockchain:", error);
        setTimeout(() => {
          setError('Failed to load the application. Check console for details.');
          setLoading(false);
        }, 2500);
      }
    };

    init();
  }, []);

  const loadServices = async (web3, contract, account) => {
    try {
      const serviceCount = await contract.methods.getServiceCount().call();
      const loadedServices = [];
      const clientServicesTemp = [];

      for (let i = 0; i < serviceCount; i++) {
        const service = await contract.methods.services(i).call();
        if (service.freelancer !== '0x0000000000000000000000000000000000000000') {
          const avgRating = await contract.methods.getAverageRating(service.freelancer).call();
          const ratingCount = await contract.methods.getRatingCount(service.freelancer).call();

          const formattedService = {
            id: i,
            freelancer: service.freelancer,
            client: service.client,
            title: service.title,
            description: service.description,
            price: web3.utils.fromWei(service.price, 'ether'),
            isActive: service.isActive,
            isPaid: service.isPaid,
            serviceRating: service.rating,
            avgRating: avgRating,
            ratingCount: ratingCount,
            deadline: service.deadline
          };

          loadedServices.push(formattedService);

          if (service.client.toLowerCase() === account.toLowerCase()) {
            clientServicesTemp.push(formattedService);
          }
        }
      }

      setServices(loadedServices);
      setClientServices(clientServicesTemp);
    } catch (error) {
      console.error("Error loading services:", error);
      setError('Failed to load services. Check console for details.');
    }
  };

  const createService = async (title, description, price, deadlineDays) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const priceInWei = web3.utils.toWei(price, 'ether');
      await contract.methods.offerService(title, description, priceInWei, deadlineDays).send({ from: accounts[0] });
      setSuccess('Service created successfully!');
      await loadServices(web3, contract, accounts[0]);
    } catch (error) {
      console.error("Error creating service:", error);
      setError('Failed to create service. Check console for details.');
    }

    setLoading(false);
  };

  const hireFreelancer = async (serviceId, price) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const priceInWei = web3.utils.toWei(price, 'ether');
      await contract.methods.hireFreelancer(serviceId).send({
        from: accounts[0],
        value: priceInWei
      });
      setSuccess('Freelancer hired successfully!');
      await loadServices(web3, contract, accounts[0]);
    } catch (error) {
      console.error("Error hiring freelancer:", error);
      setError('Failed to hire freelancer. Check console for details.');
    }

    setLoading(false);
  };

  const releasePayment = async (serviceId) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await contract.methods.releasePayment(serviceId).send({ from: accounts[0] });
      setSuccess('Payment released successfully!');
      await loadServices(web3, contract, accounts[0]);
    } catch (error) {
      console.error("Error releasing payment:", error);
      setError('Failed to release payment. Check console for details.');
    }

    setLoading(false);
  };

  const refundClient = async (serviceId) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await contract.methods.refundClient(serviceId).send({ from: accounts[0] });
      setSuccess('Refund successful!');
      await loadServices(web3, contract, accounts[0]);
    } catch (error) {
      console.error("Error refunding client:", error);
      setError('Failed to refund client. Check console for details.');
    }

    setLoading(false);
  };

  const rateService = async (serviceId, rating) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await contract.methods.rateService(serviceId, rating).send({ from: accounts[0] });
      setSuccess('Service rated successfully!');
      await loadServices(web3, contract, accounts[0]);
    } catch (error) {
      console.error("Error rating service:", error);
      setError('Failed to rate service. Check console for details.');
    }

    setLoading(false);
  };

  const toggleUserType = () => {
    setIsFreelancer(!isFreelancer);
  };

  if (isLoading) {
    return <Loading />;
  }
  return (
    <div className="App">
      <Navbar
        accounts={accounts}
        setActiveTab={setActiveTab}
        isFreelancer={isFreelancer}
        toggleUserType={toggleUserType}
        activeTab={activeTab}
      />

      <div className="container-fluid px-0 mt-4">
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{ maxWidth: '80%', width: '100%' }}>
            {activeTab === 'marketplace' && !isFreelancer && (
              <div>
                <h2>Available Services</h2>
                <ServiceList
                  services={services}
                  currentAccount={accounts[0]}
                  hireFreelancer={hireFreelancer}
                  isFreelancer={isFreelancer}
                  activeTab={activeTab}
                />
              </div>
            )}

            {activeTab === 'Marketplacef' && isFreelancer && (
              <div>
                <h2>Available Services</h2>
                <ServiceList
                  services={services}
                  currentAccount={accounts[0]}
                  hireFreelancer={hireFreelancer}
                  isFreelancer={isFreelancer}
                  activeTab={activeTab}
                />
              </div>
            )}

            {activeTab === 'offerService' && isFreelancer && (
              <div>
                <div className='mt-5' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                  <h2 className='mb-4'>Offer Your Service</h2>
                  <div className='service-form' style={{ width: '65%' }}><ServiceForm createService={createService} /></div>
                </div>
              </div>
            )}

            {activeTab === 'myServices' && isFreelancer && (
              <div>
                <h2>My Services</h2>
                <FreelancerDashboard
                  services={services}
                  currentAccount={accounts[0]}
                />
              </div>
            )}

            {activeTab === 'clientDashboard' && !isFreelancer && (
              <div>
                <h2>Services You've Hired</h2>
                <ClientDashboard
                  services={clientServices}
                  releasePayment={releasePayment}
                  rateService={rateService}
                  refundClient={refundClient}
                />
              </div>
            )}

            {activeTab === 'offerService' && !isFreelancer && setActiveTab('clientDashboard')}
            {activeTab === 'myServices' && !isFreelancer && setActiveTab('clientDashboard')}
            {activeTab === 'Marketplacef' && !isFreelancer && setActiveTab('clientDashboard')}
            {activeTab === 'marketplace' && isFreelancer && setActiveTab('myServices')}
            {activeTab === 'clientDashboard' && isFreelancer && setActiveTab('myServices')}

            <div className={`alert alert-danger ${visible && error ? 'show' : ''}`}>
              {error || ''}
            </div>

            <div className={`alert alert-success ${visible && success ? 'show' : ''}`}>
              {success || ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
