const FreelanceMarketplace = artifacts.require("FreelanceMarketplace");
const { BN, expectRevert, time } = require('@openzeppelin/test-helpers');

contract("FreelanceMarketplace", accounts => {
  const freelancer = accounts[1];
  const client = accounts[2];
  const otherUser = accounts[3];
  const servicePrice = web3.utils.toWei("0.1", "ether");
  const serviceTitle = "Web Development";
  const serviceDescription = "Create a personalized website";
  const serviceDeadlineDays = 1; 

  let freelanceMarketplace;
  let serviceId;

  beforeEach(async () => {
    freelanceMarketplace = await FreelanceMarketplace.new();
  });

  describe("Service Listing", () => {
    it("should allow freelancers to list services", async () => {
      const tx = await freelanceMarketplace.offerService(serviceTitle, serviceDescription, servicePrice, serviceDeadlineDays, { from: freelancer });
      serviceId = tx.logs[0].args.serviceId.toNumber();

      const service = await freelanceMarketplace.services(serviceId);
      assert.equal(service.freelancer, freelancer, "Freelancer address mismatch");
      assert.equal(service.title, serviceTitle, "Service title mismatch");
      assert.equal(service.description, serviceDescription, "Service description mismatch");
      assert.equal(service.price, servicePrice, "Service price mismatch");
      assert.equal(service.isActive, true, "Service should be active");

      assert.equal(tx.logs[0].event, "ServiceOffered", "Expected ServiceOffered event");
      assert.equal(tx.logs[0].args.freelancer, freelancer, "Event freelancer mismatch");
      assert.equal(tx.logs[0].args.title, serviceTitle, "Event title mismatch");
      assert.equal(tx.logs[0].args.description, serviceDescription, "Event description mismatch");
      assert.equal(tx.logs[0].args.price.toString(), servicePrice, "Event price mismatch");
      assert.equal(tx.logs[0].args.deadline.toNumber(), serviceDeadlineDays, "Event deadline mismatch");

    });

    it("should reject empty titles", async () => {
      await expectRevert(
        freelanceMarketplace.offerService("", serviceDescription, servicePrice, serviceDeadlineDays, { from: freelancer }),
        "Title cannot be empty"
      );
    });
    
    it("should reject empty desciptions", async () => {
      await expectRevert(
        freelanceMarketplace.offerService(serviceTitle, "", servicePrice, serviceDeadlineDays, { from: freelancer }),
        "Description cannot be empty"
      );
    });

    it("should reject zero prices", async () => {
      await expectRevert(
        freelanceMarketplace.offerService(serviceTitle, serviceDescription, 0, serviceDeadlineDays, { from: freelancer }),
        "Price must be greater than 0"
      );
    });

    it("should reject zero deadlines", async () => {
      await expectRevert(
        freelanceMarketplace.offerService(serviceTitle, serviceDescription, servicePrice, 0, { from: freelancer }),
        "Deadline must be in the future"
      );
    });
  });

  describe("Hiring Process", () => {
    beforeEach(async () => {
      const tx = await freelanceMarketplace.offerService(serviceTitle, serviceDescription, servicePrice, serviceDeadlineDays, { from: freelancer });
      serviceId = tx.logs[0].args.serviceId.toNumber();
    });

    it("should allow clients to hire freelancers and escrow funds correctly", async () => {
      const tx = await freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: servicePrice });

      const service = await freelanceMarketplace.services(serviceId);
      assert.equal(service.client, client, "Client address mismatch");

      const escrowedAmount = await freelanceMarketplace.escrowedFunds(serviceId);
      assert.equal(escrowedAmount, servicePrice, "Escrowed funds mismatch");

      assert.equal(tx.logs[0].event, "FreelancerHired", "Expected FreelancerHired event");
      assert.equal(tx.logs[0].args.client, client, "Event client mismatch");
    });

    it("should reject hiring with incorrect payment amount (underpayment)", async () => {
      const incorrectPrice = web3.utils.toWei("0.05", "ether");

      await expectRevert(
        freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: incorrectPrice }),
        "Payment must match service price"
      );
    });

    it("should reject hiring with incorrect payment amount (overpayment)", async () => {
      const overPrice = web3.utils.toWei("0.2", "ether");

      await expectRevert(
        freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: overPrice }),
        "Payment must match service price"
      );
    });

    it("should prevent hiring already hired services", async () => {
      await freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: servicePrice });

      await expectRevert(
        freelanceMarketplace.hireFreelancer(serviceId, { from: otherUser, value: servicePrice }),
        "Service already hired"
      );
    });
  });

  describe("Payment Release", () => {
    beforeEach(async () => {
      const tx = await freelanceMarketplace.offerService(serviceTitle, serviceDescription, servicePrice, serviceDeadlineDays, { from: freelancer });
      serviceId = tx.logs[0].args.serviceId.toNumber();
      await freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: servicePrice });
    });

    it("should allow client to release payment, and prevent double spending", async () => {
      const freelancerBalanceBefore = new BN(await web3.eth.getBalance(freelancer));

      const tx = await freelanceMarketplace.releasePayment(serviceId, { from: client });

      const service = await freelanceMarketplace.services(serviceId);
      assert.equal(service.isPaid, true, "Service should be marked as paid");
      assert.equal(service.isActive, false, "Service should be inactive");

      const escrowedAmount = await freelanceMarketplace.escrowedFunds(serviceId);
      assert.equal(escrowedAmount, 0, "Escrowed funds should be zero");

      const freelancerBalanceAfter = new BN(await web3.eth.getBalance(freelancer));
      assert.equal(
        freelancerBalanceAfter.sub(freelancerBalanceBefore).toString(),
        servicePrice,
        "Freelancer should receive payment"
      );

      assert.equal(tx.logs[0].event, "PaymentReleased", "Expected PaymentReleased event");
      assert.equal(tx.logs[0].args.freelancer, freelancer, "Event freelancer mismatch");
      assert.equal(tx.logs[0].args.amount.toString(), servicePrice, "Event amount mismatch");
    });

    it("should prevent non-clients from releasing payment", async () => {
      await expectRevert(
        freelanceMarketplace.releasePayment(serviceId, { from: otherUser }),
        "Only client can release payment"
      );
    });

    it("should prevent double payment", async () => {
      await freelanceMarketplace.releasePayment(serviceId, { from: client });

      await expectRevert(
        freelanceMarketplace.releasePayment(serviceId, { from: client }),
        "Payment already released"
      );
    });
  });

  describe("Refund Process", () => {
    beforeEach(async () => {
      const tx = await freelanceMarketplace.offerService(serviceTitle, serviceDescription, servicePrice, serviceDeadlineDays, { from: freelancer });
      serviceId = tx.logs[0].args.serviceId.toNumber();
      await freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: servicePrice });
    });

    it("should prevent refund before deadline", async () => {
      await expectRevert(
        freelanceMarketplace.refundClient(serviceId, { from: client }),
        "Refunds won't be issued before the deadline"
      );
    });

    it("should allow client to refund after deadline", async () => {
      const service = await freelanceMarketplace.services(serviceId);
      await time.increaseTo(new BN(service.deadline).add(time.duration.seconds(1)));

      const clientBalanceBefore = new BN(await web3.eth.getBalance(client));
      const tx = await freelanceMarketplace.refundClient(serviceId, { from: client });

      const escrowedAmount = await freelanceMarketplace.escrowedFunds(serviceId);
      assert.equal(escrowedAmount, 0, "Escrowed funds should be zero");
      const updatedService = await freelanceMarketplace.services(serviceId);
      assert.equal(updatedService.isActive, false, "Service should be inactive after refund");

      const clientBalanceAfter = new BN(await web3.eth.getBalance(client));
      assert(
        clientBalanceAfter.sub(clientBalanceBefore).gt(new BN(servicePrice).sub(new BN(web3.utils.toWei("0.01", "ether")))),
        "Client should receive refund"
      );

      assert.equal(tx.logs[0].event, "ClientRefunded", "Expected ClientRefunded event");
      assert.equal(tx.logs[0].args.client, client, "Event client mismatch");
      assert.equal(tx.logs[0].args.amount.toString(), servicePrice, "Event amount mismatch");
    });

    it("should prevent non-client from refunding", async () => {
      const service = await freelanceMarketplace.services(serviceId);
      await time.increaseTo(new BN(service.deadline).add(time.duration.seconds(1)));

      await expectRevert(
        freelanceMarketplace.refundClient(serviceId, { from: otherUser }),
        "Only client can request refund"
      );
    });

    it("should prevent double refunds", async () => {
      const service = await freelanceMarketplace.services(serviceId);
      await time.increaseTo(new BN(service.deadline).add(time.duration.seconds(1)));

      await freelanceMarketplace.refundClient(serviceId, { from: client });

      await expectRevert(
        freelanceMarketplace.refundClient(serviceId, { from: client }),
        "No funds in escrow"
      );
    });
  });

  describe("Rating Services", () => {
    beforeEach(async () => {
      let tx = await freelanceMarketplace.offerService(serviceTitle, serviceDescription, servicePrice, serviceDeadlineDays, { from: freelancer });
      serviceId = tx.logs[0].args.serviceId.toNumber();
      await freelanceMarketplace.hireFreelancer(serviceId, { from: client, value: servicePrice });
      await freelanceMarketplace.releasePayment(serviceId, { from: client });
    });

    it("should allow client to rate a service after payment", async () => {
      const tx = await freelanceMarketplace.rateService(serviceId, 5, { from: client });

      const avg = await freelanceMarketplace.getAverageRating(freelancer);
      assert.equal(avg.toString(), '5', "Average rating should be 5");
      const count = await freelanceMarketplace.getRatingCount(freelancer);
      assert.equal(count.toString(), '1', "Rating count should be 1");

      assert.equal(tx.logs[0].event, "ServiceRated", "Expected ServiceRated event");
      assert.equal(tx.logs[0].args.rating.toString(), '5', "Event rating mismatch");
    });

    it("should prevent rating outside 1-5", async () => {
      await expectRevert(
        freelanceMarketplace.rateService(serviceId, 0, { from: client }),
        "Rating must be between 1 and 5"
      );
      await expectRevert(
        freelanceMarketplace.rateService(serviceId, 6, { from: client }),
        "Rating must be between 1 and 5"
      );
    });

    it("should prevent non-client from rating", async () => {
      await expectRevert(
        freelanceMarketplace.rateService(serviceId, 4, { from: otherUser }),
        "Only client can rate"
      );
    });
  });

  describe("Utility Views", () => {
    it("should return correct service count", async () => {
      assert.equal((await freelanceMarketplace.getServiceCount()).toString(), '0');
      await freelanceMarketplace.offerService(serviceTitle, serviceDescription, servicePrice, serviceDeadlineDays, { from: freelancer });
      assert.equal((await freelanceMarketplace.getServiceCount()).toString(), '1');
    });
  });
});
