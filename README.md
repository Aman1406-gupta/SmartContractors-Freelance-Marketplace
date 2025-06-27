# Decentralized Freelance Marketplace
A trustless freelance marketplace where freelancers can offer services and clients can hire them with secure escrow payment.
This project was made for *CS 218: Programmable and Interoperable Blockchains* by

<div align="center">

### Team: SmartContractors
| Name         | Roll No |
|--------------|---------|
| Abhinav Bitragunta        | 230001003     |
| Aman Gupta          | 230001006     |
| Rayavarapu Sreechand   | 230001068   |
| Srinidhi Sai Boorgu     | 230001072     |
| Ansh Jain   | 230004005 |
| Bhumika Aggarwal | 230005011 |

</div>

## Features

- Freelancers can list services with a title, description, price, and availability (in days). These will be listed in the marketplace for anyone to hire
- The marketplace displays currently active services offered by freelancers on the network. Each service has its title, description, price, and availability listed
- Clients can hire freelancers from the marketplace, escrow payments, and release them upon completion (handled by smart contracts)
- Clients can view the details of every service they've hired
- Freelancers can view the services they offer, along with the details of each service
  
We implemented the following *bonus features* as well
- The services listed on the marketplace are accompanied by the average rating for the freelancer offering it, and the number of ratings they've received to date
- Upon the completion of a service, the client may rate it on a 1-5 scale based on their degree of satisfaction. This affects the freelancer's average rating
- The rating obtained for each service is visible to the freelancer
- Clients can refund their payment in case their work isn't completed by the end of the availability period of that service

## Instructions for setup (Windows)

`Node v18.20.8`, `npm 10.8.2`, the Ganache application for Windows, and the MetaMask browser extension are required. Once you've verified the installation and usage of said versions, follow the next instructions
### 1. Clone the repository and install dependencies
It is highly recommended that you clone into a path without any spaces in it.
``` bash
git clone https://github.com/Abhinav-Bitragunta/SmartContractors-Freelance-Marketplace
cd SmartContractors-Freelance-Marketplace
npm install
```
### 2. Set up a new workspace in Ganache
![image](https://github.com/user-attachments/assets/47c1b4ba-2682-4c2a-80a8-b4e58cc73221)
Title it as you wish, and add the `truffle-config.js` file in the root directory as a project
![image](https://github.com/user-attachments/assets/babd9e31-4b1e-4563-9839-e6a84c4efd19)
Make sure the options in the server tab are selected as follows, and click start
![image](https://github.com/user-attachments/assets/dfb7ed25-2222-48bb-ae87-bd0addbe2cfe)

### 3. Connect Metamask to Ganache
In the Accounts tab in Ganache, pick any account and click on the key icon on the right
![image](https://github.com/user-attachments/assets/4c5e31dd-e9a2-4a2d-b976-407da2be8d2f)
Copy the private key that shows up here to your clipboard
<div align="center">
   
![image](https://github.com/user-attachments/assets/7b6b35d3-a22a-44a0-9833-d4dc8ec43a12)

</div>
Open and log into your MetaMask account, and select the dropdown that allows you to change the network

![image](https://github.com/user-attachments/assets/139ef8b7-3963-492c-b498-2e7439f0b892)
Here, select Add a custom network
<div align="center">
   
![image](https://github.com/user-attachments/assets/042de63a-0e5c-410c-889b-21b2ac9e05c8)

</div>
Save with the following fields
<div align="center">
   
![image](https://github.com/user-attachments/assets/545b558c-2b7a-4e28-917a-0d841e00f980)

</div>
Switch to the newly created testnet, and then select the highlighted dropdown.
<div align="center">
   
![image](https://github.com/user-attachments/assets/8d0ed1ce-3ab6-4084-a37f-aa1625a54c2c)

</div>
Select Add account or hardware wallet, paste the address copied earlier, and select import.
<div align="center">
   
![image](https://github.com/user-attachments/assets/83b2d64e-78bc-4297-b6a3-2fb2070bc695)
![image](https://github.com/user-attachments/assets/fba6958e-390f-447a-8ab6-a443492d0be0)
![image](https://github.com/user-attachments/assets/3a406c07-f786-4fa3-a752-44844eb07d08)

</div>
Your interface should now look like this

![image](https://github.com/user-attachments/assets/f269bb8c-0a1c-452d-beed-5a0ef07bda8e)

### 4. Compile the contracts and run the application
Open a terminal in the root directory of the project, and run
``` bash
truffle compile
truffle migrate --reset
npm start
```
Your interface, after all the commands finish execution, should now look like this.

![image](https://github.com/user-attachments/assets/ff47c62e-71c4-4c96-be4b-1c69e684fe9d)

Now connect your account by opening MetaMask(make sure you're on the right test network!).
<div align="center">
   
![image](https://github.com/user-attachments/assets/e7b8ff35-0d61-4083-b0a4-cb670303b2cb)


</div>
The connection, followed by a refresh, completes the setup.

## Usage

### For Freelancers:
1. Make sure you're in "Freelancer Mode" (toggle in the navbar)
2. Click "Offer Service" in the navigation
3. Fill out the service form with title, description, price and availability period.
4. Submit the form to create your service listing
5. You can view the status of your services in the "My Services" tab

### For Clients:
1. Switch to "Client Mode" (toggle in the navbar)
2. Browse available services in the Marketplace (watch out for the ratings)
3. Click "Hire Freelancer" on a service to hire and pay
4. Check "My Hired Services" to manage and view your hired services
5. Release payment when work is complete
6. Rate completed services as desired
7. In case the deadline passes, the refund option becomes available

## Testing
Run the following in a terminal opened in the root directory to run the tests(after terminating the website instance, in a new terminal if necessary).
``` bash
truffle test
```
<div align="center">

![image](https://github.com/user-attachments/assets/90407c4c-2bbb-46f7-a284-a5c3755944a5)

</div>

## Future Work

- The MarketPlace tab on client-side and freelancer-side could be refined by adding a categorise option, enabling easier searching
- Freelancers could voluntarily post their CV which would be stored off-chain to represent their legitimacy or involvement with a well known organisation
- Clients could be given a Trust Score which would directly reflect their past interactions with other freelancers
- Incorporation of a Decentralised Dispute Resolution System that could resolve payment or rating disputes when presented with appropriate evidence
