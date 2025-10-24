/** @format */

import { describe, it, expect, beforeEach } from "vitest";
import { stringAsciiCV, uintCV, listCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_TITLE = 101;
const ERR_INVALID_DESCRIPTION = 102;
const ERR_INVALID_FUNDING_GOAL = 103;
const ERR_INVALID_DURATION = 104;
const ERR_INVALID_PROJECT_TYPE = 105;
const ERR_INVALID_LOCATION = 106;
const ERR_INVALID_MILESTONES = 107;
const ERR_PROPOSAL_ALREADY_EXISTS = 108;
const ERR_PROPOSAL_NOT_FOUND = 109;
const ERR_INVALID_VOTING_PERIOD = 112;
const ERR_INVALID_QUORUM = 113;
const ERR_MAX_PROPOSALS_EXCEEDED = 114;
const ERR_INVALID_UPDATE_PARAM = 115;
const ERR_INVALID_ENVIRONMENT_IMPACT = 117;
const ERR_INVALID_COST_BREAKDOWN = 118;
const ERR_INVALID_RISK_ASSESSMENT = 119;
const ERR_INVALID_TEAM_DETAILS = 120;
const ERR_AUTHORITY_NOT_VERIFIED = 111;

interface Proposal {
  title: string;
  description: string;
  fundingGoal: number;
  duration: number;
  projectType: string;
  location: string;
  milestones: string[];
  timestamp: number;
  proposer: string;
  status: string;
  votingStart: number;
  votingEnd: number;
  quorum: number;
  environmentImpact: string;
  costBreakdown: string;
  riskAssessment: string;
  teamDetails: string;
}

interface ProposalUpdate {
  updateTitle: string;
  updateDescription: string;
  updateFundingGoal: number;
  updateTimestamp: number;
  updater: string;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class DAOProposalMock {
  state: {
    nextProposalId: number;
    maxProposals: number;
    proposalFee: number;
    authorityContract: string | null;
    proposals: Map<number, Proposal>;
    proposalUpdates: Map<number, ProposalUpdate>;
    proposalsByTitle: Map<string, number>;
  } = {
    nextProposalId: 0,
    maxProposals: 1000,
    proposalFee: 1000,
    authorityContract: null,
    proposals: new Map(),
    proposalUpdates: new Map(),
    proposalsByTitle: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1TEST";
  authorities: Set<string> = new Set(["ST1TEST"]);
  stxTransfers: Array<{ amount: number; from: string; to: string | null }> = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextProposalId: 0,
      maxProposals: 1000,
      proposalFee: 1000,
      authorityContract: null,
      proposals: new Map(),
      proposalUpdates: new Map(),
      proposalsByTitle: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.authorities = new Set(["ST1TEST"]);
    this.stxTransfers = [];
  }

  isVerifiedAuthority(principal: string): Result<boolean> {
    return { ok: true, value: this.authorities.has(principal) };
  }

  setAuthorityContract(contractPrincipal: string): Result<boolean> {
    if (contractPrincipal === "SP000000000000000000002Q6VF78") {
      return { ok: false, value: false };
    }
    if (this.state.authorityContract !== null) {
      return { ok: false, value: false };
    }
    this.state.authorityContract = contractPrincipal;
    return { ok: true, value: true };
  }

  setProposalFee(newFee: number): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    this.state.proposalFee = newFee;
    return { ok: true, value: true };
  }

  createProposal(
    title: string,
    description: string,
    fundingGoal: number,
    duration: number,
    projectType: string,
    location: string,
    milestones: string[],
    votingStart: number,
    votingEnd: number,
    quorum: number,
    environmentImpact: string,
    costBreakdown: string,
    riskAssessment: string,
    teamDetails: string
  ): Result<number> {
    if (this.state.nextProposalId >= this.state.maxProposals)
      return { ok: false, value: ERR_MAX_PROPOSALS_EXCEEDED };
    if (!title || title.length > 100)
      return { ok: false, value: ERR_INVALID_TITLE };
    if (!description || description.length > 1000)
      return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (fundingGoal <= 0) return { ok: false, value: ERR_INVALID_FUNDING_GOAL };
    if (duration <= 0) return { ok: false, value: ERR_INVALID_DURATION };
    if (!["solar", "wind", "hydro", "biomass"].includes(projectType))
      return { ok: false, value: ERR_INVALID_PROJECT_TYPE };
    if (!location || location.length > 100)
      return { ok: false, value: ERR_INVALID_LOCATION };
    if (milestones.length <= 0 || milestones.length > 10)
      return { ok: false, value: ERR_INVALID_MILESTONES };
    if (!(votingStart > this.blockHeight && votingEnd > votingStart))
      return { ok: false, value: ERR_INVALID_VOTING_PERIOD };
    if (quorum <= 0 || quorum > 100)
      return { ok: false, value: ERR_INVALID_QUORUM };
    if (environmentImpact.length > 500)
      return { ok: false, value: ERR_INVALID_ENVIRONMENT_IMPACT };
    if (costBreakdown.length > 500)
      return { ok: false, value: ERR_INVALID_COST_BREAKDOWN };
    if (riskAssessment.length > 500)
      return { ok: false, value: ERR_INVALID_RISK_ASSESSMENT };
    if (teamDetails.length > 500)
      return { ok: false, value: ERR_INVALID_TEAM_DETAILS };
    if (!this.isVerifiedAuthority(this.caller).value)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (this.state.proposalsByTitle.has(title))
      return { ok: false, value: ERR_PROPOSAL_ALREADY_EXISTS };
    if (!this.state.authorityContract)
      return { ok: false, value: ERR_AUTHORITY_NOT_VERIFIED };

    this.stxTransfers.push({
      amount: this.state.proposalFee,
      from: this.caller,
      to: this.state.authorityContract,
    });

    const id = this.state.nextProposalId;
    const proposal: Proposal = {
      title,
      description,
      fundingGoal,
      duration,
      projectType,
      location,
      milestones,
      timestamp: this.blockHeight,
      proposer: this.caller,
      status: "pending",
      votingStart,
      votingEnd,
      quorum,
      environmentImpact,
      costBreakdown,
      riskAssessment,
      teamDetails,
    };
    this.state.proposals.set(id, proposal);
    this.state.proposalsByTitle.set(title, id);
    this.state.nextProposalId++;
    return { ok: true, value: id };
  }

  getProposal(id: number): Proposal | null {
    return this.state.proposals.get(id) || null;
  }

  updateProposal(
    id: number,
    updateTitle: string,
    updateDescription: string,
    updateFundingGoal: number
  ): Result<boolean> {
    const proposal = this.state.proposals.get(id);
    if (!proposal) return { ok: false, value: false };
    if (proposal.proposer !== this.caller) return { ok: false, value: false };
    if (!updateTitle || updateTitle.length > 100)
      return { ok: false, value: false };
    if (!updateDescription || updateDescription.length > 1000)
      return { ok: false, value: false };
    if (updateFundingGoal <= 0) return { ok: false, value: false };
    if (
      this.state.proposalsByTitle.has(updateTitle) &&
      this.state.proposalsByTitle.get(updateTitle) !== id
    ) {
      return { ok: false, value: false };
    }

    const updated: Proposal = {
      ...proposal,
      title: updateTitle,
      description: updateDescription,
      fundingGoal: updateFundingGoal,
      timestamp: this.blockHeight,
    };
    this.state.proposals.set(id, updated);
    this.state.proposalsByTitle.delete(proposal.title);
    this.state.proposalsByTitle.set(updateTitle, id);
    this.state.proposalUpdates.set(id, {
      updateTitle,
      updateDescription,
      updateFundingGoal,
      updateTimestamp: this.blockHeight,
      updater: this.caller,
    });
    return { ok: true, value: true };
  }

  getProposalCount(): Result<number> {
    return { ok: true, value: this.state.nextProposalId };
  }

  checkProposalExistence(title: string): Result<boolean> {
    return { ok: true, value: this.state.proposalsByTitle.has(title) };
  }
}

describe("DAOProposal", () => {
  let contract: DAOProposalMock;

  beforeEach(() => {
    contract = new DAOProposalMock();
    contract.reset();
  });

  it("creates a proposal successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.createProposal(
      "Solar Farm",
      "Build solar panels",
      100000,
      365,
      "solar",
      "Desert Area",
      ["Site prep", "Installation"],
      10,
      20,
      50,
      "Reduces CO2",
      "Panels: 50k",
      "Weather risks",
      "Team of 5"
    );
    expect(result.ok).toBe(true);
    expect(result.value).toBe(0);

    const proposal = contract.getProposal(0);
    expect(proposal?.title).toBe("Solar Farm");
    expect(proposal?.description).toBe("Build solar panels");
    expect(proposal?.fundingGoal).toBe(100000);
    expect(proposal?.duration).toBe(365);
    expect(proposal?.projectType).toBe("solar");
    expect(proposal?.location).toBe("Desert Area");
    expect(proposal?.milestones).toEqual(["Site prep", "Installation"]);
    expect(proposal?.status).toBe("pending");
    expect(proposal?.votingStart).toBe(10);
    expect(proposal?.votingEnd).toBe(20);
    expect(proposal?.quorum).toBe(50);
    expect(proposal?.environmentImpact).toBe("Reduces CO2");
    expect(proposal?.costBreakdown).toBe("Panels: 50k");
    expect(proposal?.riskAssessment).toBe("Weather risks");
    expect(proposal?.teamDetails).toBe("Team of 5");
    expect(contract.stxTransfers).toEqual([
      { amount: 1000, from: "ST1TEST", to: "ST2TEST" },
    ]);
  });

  it("rejects duplicate proposal titles", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createProposal(
      "Solar Farm",
      "Build solar panels",
      100000,
      365,
      "solar",
      "Desert Area",
      ["Site prep", "Installation"],
      10,
      20,
      50,
      "Reduces CO2",
      "Panels: 50k",
      "Weather risks",
      "Team of 5"
    );
    const result = contract.createProposal(
      "Solar Farm",
      "Another desc",
      200000,
      730,
      "wind",
      "Mountain",
      ["Foundation", "Turbines"],
      30,
      40,
      60,
      "Green energy",
      "Turbines: 100k",
      "Bird risks",
      "Team of 10"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_PROPOSAL_ALREADY_EXISTS);
  });

  it("rejects non-authorized caller", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.caller = "ST2FAKE";
    contract.authorities = new Set();
    const result = contract.createProposal(
      "Wind Farm",
      "Build wind turbines",
      200000,
      730,
      "wind",
      "Mountain",
      ["Foundation", "Turbines"],
      10,
      20,
      50,
      "Reduces CO2",
      "Turbines: 100k",
      "Bird risks",
      "Team of 10"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("rejects proposal creation without authority contract", () => {
    const result = contract.createProposal(
      "NoAuth",
      "No auth desc",
      1000,
      30,
      "solar",
      "City",
      ["Step1"],
      5,
      10,
      50,
      "Impact",
      "Costs",
      "Risks",
      "Team"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_AUTHORITY_NOT_VERIFIED);
  });

  it("rejects invalid project type", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.createProposal(
      "InvalidType",
      "Desc",
      1000,
      30,
      "invalid",
      "Location",
      ["Mile1"],
      10,
      20,
      50,
      "Impact",
      "Costs",
      "Risks",
      "Team"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_PROJECT_TYPE);
  });

  it("updates a proposal successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createProposal(
      "Old Proposal",
      "Old desc",
      1000,
      30,
      "solar",
      "Old loc",
      ["Old mile"],
      10,
      20,
      50,
      "Old impact",
      "Old costs",
      "Old risks",
      "Old team"
    );
    const result = contract.updateProposal(0, "New Proposal", "New desc", 2000);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const proposal = contract.getProposal(0);
    expect(proposal?.title).toBe("New Proposal");
    expect(proposal?.description).toBe("New desc");
    expect(proposal?.fundingGoal).toBe(2000);
    const update = contract.state.proposalUpdates.get(0);
    expect(update?.updateTitle).toBe("New Proposal");
    expect(update?.updateDescription).toBe("New desc");
    expect(update?.updateFundingGoal).toBe(2000);
    expect(update?.updater).toBe("ST1TEST");
  });

  it("rejects update for non-existent proposal", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.updateProposal(99, "New Title", "New Desc", 2000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("rejects update by non-proposer", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createProposal(
      "Test Proposal",
      "Test desc",
      1000,
      30,
      "solar",
      "Test loc",
      ["Test mile"],
      10,
      20,
      50,
      "Test impact",
      "Test costs",
      "Test risks",
      "Test team"
    );
    contract.caller = "ST3FAKE";
    const result = contract.updateProposal(0, "New Title", "New Desc", 2000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("sets proposal fee successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.setProposalFee(2000);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.proposalFee).toBe(2000);
    contract.createProposal(
      "Test Proposal",
      "Test desc",
      1000,
      30,
      "solar",
      "Test loc",
      ["Test mile"],
      10,
      20,
      50,
      "Test impact",
      "Test costs",
      "Test risks",
      "Test team"
    );
    expect(contract.stxTransfers).toEqual([
      { amount: 2000, from: "ST1TEST", to: "ST2TEST" },
    ]);
  });

  it("rejects proposal fee change without authority contract", () => {
    const result = contract.setProposalFee(2000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("returns correct proposal count", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createProposal(
      "Proposal1",
      "Desc1",
      1000,
      30,
      "solar",
      "Loc1",
      ["Mile1"],
      10,
      20,
      50,
      "Impact1",
      "Costs1",
      "Risks1",
      "Team1"
    );
    contract.createProposal(
      "Proposal2",
      "Desc2",
      2000,
      60,
      "wind",
      "Loc2",
      ["Mile2"],
      30,
      40,
      60,
      "Impact2",
      "Costs2",
      "Risks2",
      "Team2"
    );
    const result = contract.getProposalCount();
    expect(result.ok).toBe(true);
    expect(result.value).toBe(2);
  });

  it("checks proposal existence correctly", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createProposal(
      "Test Proposal",
      "Test desc",
      1000,
      30,
      "solar",
      "Test loc",
      ["Test mile"],
      10,
      20,
      50,
      "Test impact",
      "Test costs",
      "Test risks",
      "Test team"
    );
    const result = contract.checkProposalExistence("Test Proposal");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const result2 = contract.checkProposalExistence("NonExistent");
    expect(result2.ok).toBe(true);
    expect(result2.value).toBe(false);
  });

  it("parses proposal parameters with Clarity types", () => {
    const title = stringAsciiCV("Test Proposal");
    const fundingGoal = uintCV(1000);
    const milestones = listCV([stringAsciiCV("Mile1"), stringAsciiCV("Mile2")]);
    expect(title.value).toBe("Test Proposal");
    expect(fundingGoal.value).toEqual(BigInt(1000));
    expect(milestones.value[0].value).toBe("Mile1");
    expect(milestones.value[1].value).toBe("Mile2");
  });

  it("rejects proposal creation with empty title", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.createProposal(
      "",
      "Desc",
      1000,
      30,
      "solar",
      "Loc",
      ["Mile"],
      10,
      20,
      50,
      "Impact",
      "Costs",
      "Risks",
      "Team"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_TITLE);
  });

  it("rejects proposal creation with max proposals exceeded", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.state.maxProposals = 1;
    contract.createProposal(
      "Proposal1",
      "Desc1",
      1000,
      30,
      "solar",
      "Loc1",
      ["Mile1"],
      10,
      20,
      50,
      "Impact1",
      "Costs1",
      "Risks1",
      "Team1"
    );
    const result = contract.createProposal(
      "Proposal2",
      "Desc2",
      2000,
      60,
      "wind",
      "Loc2",
      ["Mile2"],
      30,
      40,
      60,
      "Impact2",
      "Costs2",
      "Risks2",
      "Team2"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_MAX_PROPOSALS_EXCEEDED);
  });

  it("sets authority contract successfully", () => {
    const result = contract.setAuthorityContract("ST2TEST");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.authorityContract).toBe("ST2TEST");
  });

  it("rejects invalid authority contract", () => {
    const result = contract.setAuthorityContract(
      "SP000000000000000000002Q6VF78"
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });
});
