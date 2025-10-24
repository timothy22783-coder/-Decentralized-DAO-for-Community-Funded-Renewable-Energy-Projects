# 🌱 Decentralized DAO for Community-Funded Renewable Energy Projects

Welcome to a revolutionary Web3 platform that empowers communities to fund and accelerate renewable energy initiatives! This DAO uses the Stacks blockchain and Clarity smart contracts to democratize funding for solar, wind, and other green projects, while incorporating yield farming to reward participants. It solves the real-world problem of limited access to capital for sustainable energy, reducing reliance on centralized institutions and incentivizing global participation through blockchain incentives.

## ✨ Features

🌍 Propose and vote on real-world renewable energy projects  
💰 Community pooling of funds via token contributions  
📈 Yield farming rewards for stakers based on project milestones  
🗳️ Token-based governance for transparent decision-making  
🔒 Secure fund disbursement tied to verifiable project progress  
📊 Track project impact with on-chain metrics  
🚀 Scalable with 8 interconnected Clarity smart contracts  
✅ Prevent fraud through oracle-verified real-world data  

## 🛠 How It Works

This project leverages 8 Clarity smart contracts to create a robust ecosystem. Here's a high-level overview of the contracts involved:

1. **GovernanceToken.clar**: Manages the ERC-20-like fungible token (e.g., GREEN-DAO) used for voting and staking. Handles minting, burning, and transfers.  
2. **DAOProposal.clar**: Allows users to create proposals for new renewable energy projects, including details like project description, funding goal, and timelines.  
3. **DAOVoting.clar**: Enables token holders to vote on proposals. Uses weighted voting based on staked tokens; proposals pass with a quorum and majority.  
4. **FundingPool.clar**: A treasury contract that collects STX or token contributions from the community and locks them until a project is approved.  
5. **ProjectRegistry.clar**: Registers approved projects on-chain, storing metadata like location, type (e.g., solar farm), and milestones. Issues NFTs for project ownership or backer certificates.  
6. **YieldFarming.clar**: Staking contract where users lock GREEN-DAO tokens to earn yields. Rewards are distributed based on the DAO's overall performance and project successes.  
7. **RewardDistributor.clar**: Calculates and distributes farming rewards, integrating with oracles to factor in real-world project outcomes (e.g., energy output metrics).  
8. **ProgressOracle.clar**: Interfaces with external oracles to verify project milestones (e.g., via Chainlink-like feeds), triggering fund releases or reward boosts upon confirmation.  

**For Community Members (Funders and Voters)**  

- Acquire GREEN-DAO tokens via initial distribution or exchanges.  
- Stake tokens in the YieldFarming contract to start earning rewards while supporting the ecosystem.  
- Propose a renewable energy project using DAOProposal, providing details and a funding ask.  
- Vote on active proposals via DAOVoting – your staked tokens give you influence!  
- Once approved, funds from FundingPool are allocated to the project.  

Boom! You're now part of funding the green revolution, with yields compounding as projects succeed.

**For Project Creators**  

- Register your approved project in ProjectRegistry to receive funds.  
- Update milestones through verifiable oracle data in ProgressOracle.  
- As milestones are hit, funds are automatically disbursed from FundingPool, and backers earn boosted yields via RewardDistributor.  

**For Yield Farmers**  

- Stake GREEN-DAO in YieldFarming to farm rewards.  
- Monitor DAO performance – successful projects increase the reward pool, creating a positive feedback loop.  
- Claim rewards from RewardDistributor at any time, with vesting options for long-term holders.