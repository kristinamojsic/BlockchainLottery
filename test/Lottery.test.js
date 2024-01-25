const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Lottery", function () {
  let Lottery;
  let lottery;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    Lottery = await ethers.getContractFactory("Lottery");
    [owner, player1, player2] = await ethers.getSigners();

    lottery = await Lottery.deploy();
  
  });

  it("should allow players to enter the lottery", async function () {
    
    const initialBalance = await ethers.provider.getBalance(lottery.target);

    await lottery.connect(player1).enter({ value: ethers.parseEther("0.001") });

    const players = await lottery.getPlayers();
    expect(players.length).to.equal(1);
    expect(players[0]).to.equal(player1.address);

    const newBalance = await ethers.provider.getBalance(lottery.target);
    const expectedBalance = initialBalance + ethers.parseEther("0.001");
    expect(newBalance).to.equal(expectedBalance);
  });

  it("should not allow entering without sufficient funds", async function () {
    await expect(
      lottery.connect(player1).enter({ value: ethers.parseEther("0.0005") })
    ).to.be.revertedWith("Insufficient funds.");

    const players = await lottery.getPlayers();
    expect(players.length).to.equal(0);
  });

  it("should only allow the owner to pick the winner", async function () {
    await lottery.connect(player1).enter({ value: ethers.parseEther("0.001") });
    await lottery.connect(player2).enter({ value: ethers.parseEther("0.001") });

    await expect(lottery.connect(player1).pickWinner()).to.be.revertedWith("Ownable: caller is not the owner");

    await lottery.connect(owner).pickWinner();
    const winner = await lottery.getWinner();
    expect(winner).to.not.equal("0x0000000000000000000000000000000000000000");
  });

  it("should not allow owner to pick winner multiple times",async function ()
  {
    await lottery.connect(player1).enter({ value: ethers.parseEther("0.001") });
    await lottery.connect(player2).enter({ value: ethers.parseEther("0.001") });
    await lottery.connect(owner).pickWinner();
    await expect (lottery.connect(owner).pickWinner()).to.be.revertedWith("Lottery has ended.");
  })

  it("should not allow picking winner before participants have entered", async function () {
    await expect(lottery.connect(owner).pickWinner()).to.be.revertedWith("No participants.");
  });

  it("should not allow the non-winner to claim the prize", async function () {
    await lottery.connect(player1).enter({ value: ethers.parseEther("0.001") });
    await lottery.connect(player2).enter({ value: ethers.parseEther("0.001") });

    await lottery.connect(owner).pickWinner();
    const winnerAddress = await lottery.getWinner();
    const winner = await ethers.getSigner(winnerAddress);
    
    if(player1.address!=winnerAddress){
      await expect(lottery.connect(player1).claimPrize()).to.be.revertedWith("You are not the winner.");
    }
    else{
      await expect(lottery.connect(player2).claimPrize()).to.be.revertedWith("You are not the winner.");
    }
  });
  
  it("should change the winners balance after claiming the prize", async function () {
    await lottery.connect(player1).enter({ value: ethers.parseEther("0.001") });
    await lottery.connect(player2).enter({ value: ethers.parseEther("0.001") });

    await lottery.connect(owner).pickWinner();

    const winnerAddress = await lottery.getWinner();
    const winner = await ethers.getSigner(winnerAddress);

    const initialBalance = await ethers.provider.getBalance(winnerAddress);
    await lottery.connect(winner).claimPrize();
    const newBalance = await ethers.provider.getBalance(winnerAddress);
    expect(newBalance).to.be.gt(initialBalance);
    
  });


it("should not allow players to enter after lottery has ended", async function () {
  await lottery.connect(player1).enter({ value: ethers.parseEther("0.001") });
  await lottery.connect(player2).enter({ value: ethers.parseEther("0.001") });
  
  await lottery.connect(owner).pickWinner();
  
  await expect(lottery.connect(player2).enter({ value: ethers.parseEther("0.001") }))
    .to.be.revertedWith("Lottery has ended.");
});

});
