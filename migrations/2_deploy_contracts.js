const FreelanceMarketplace = artifacts.require("FreelanceMarketplace");

module.exports = function(deployer) {
  deployer.deploy(FreelanceMarketplace);
};
