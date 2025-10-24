(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INVALID-TITLE u101)
(define-constant ERR-INVALID-DESCRIPTION u102)
(define-constant ERR-INVALID-FUNDING-GOAL u103)
(define-constant ERR-INVALID-DURATION u104)
(define-constant ERR-INVALID-PROJECT-TYPE u105)
(define-constant ERR-INVALID-LOCATION u106)
(define-constant ERR-INVALID-MILESTONES u107)
(define-constant ERR-PROPOSAL-ALREADY-EXISTS u108)
(define-constant ERR-PROPOSAL-NOT-FOUND u109)
(define-constant ERR-INVALID-TIMESTAMP u110)
(define-constant ERR-AUTHORITY-NOT-VERIFIED u111)
(define-constant ERR-INVALID-VOTING_PERIOD u112)
(define-constant ERR-INVALID-QUORUM u113)
(define-constant ERR-MAX-PROPOSALS_EXCEEDED u114)
(define-constant ERR-INVALID-UPDATE-PARAM u115)
(define-constant ERR-INVALID-STATUS u116)
(define-constant ERR-INVALID-ENVIRONMENT_IMPACT u117)
(define-constant ERR-INVALID-COST_BREAKDOWN u118)
(define-constant ERR-INVALID-RISK_ASSESSMENT u119)
(define-constant ERR-INVALID-TEAM_DETAILS u120)

(define-data-var next-proposal-id uint u0)
(define-data-var max-proposals uint u1000)
(define-data-var proposal-fee uint u1000)
(define-data-var authority-contract (optional principal) none)

(define-map proposals
  uint
  {
    title: (string-ascii 100),
    description: (string-ascii 1000),
    funding-goal: uint,
    duration: uint,
    project-type: (string-ascii 50),
    location: (string-ascii 100),
    milestones: (list 10 (string-ascii 200)),
    timestamp: uint,
    proposer: principal,
    status: (string-ascii 20),
    voting-start: uint,
    voting-end: uint,
    quorum: uint,
    environment-impact: (string-ascii 500),
    cost-breakdown: (string-ascii 500),
    risk-assessment: (string-ascii 500),
    team-details: (string-ascii 500)
  }
)

(define-map proposals-by-title
  (string-ascii 100)
  uint)

(define-map proposal-updates
  uint
  {
    update-title: (string-ascii 100),
    update-description: (string-ascii 1000),
    update-funding-goal: uint,
    update-timestamp: uint,
    updater: principal
  }
)

(define-read-only (get-proposal (id uint))
  (map-get? proposals id)
)

(define-read-only (get-proposal-updates (id uint))
  (map-get? proposal-updates id)
)

(define-read-only (is-proposal-registered (title (string-ascii 100)))
  (is-some (map-get? proposals-by-title title))
)

(define-private (validate-title (title (string-ascii 100)))
  (if (and (> (len title) u0) (<= (len title) u100))
      (ok true)
      (err ERR-INVALID-TITLE))
)

(define-private (validate-description (desc (string-ascii 1000)))
  (if (and (> (len desc) u0) (<= (len desc) u1000))
      (ok true)
      (err ERR-INVALID-DESCRIPTION))
)

(define-private (validate-funding-goal (goal uint))
  (if (> goal u0)
      (ok true)
      (err ERR-INVALID-FUNDING-GOAL))
)

(define-private (validate-duration (dur uint))
  (if (> dur u0)
      (ok true)
      (err ERR-INVALID-DURATION))
)

(define-private (validate-project-type (ptype (string-ascii 50)))
  (if (or (is-eq ptype "solar") (is-eq ptype "wind") (is-eq ptype "hydro") (is-eq ptype "biomass"))
      (ok true)
      (err ERR-INVALID-PROJECT-TYPE))
)

(define-private (validate-location (loc (string-ascii 100)))
  (if (and (> (len loc) u0) (<= (len loc) u100))
      (ok true)
      (err ERR-INVALID-LOCATION))
)

(define-private (validate-milestones (miles (list 10 (string-ascii 200))))
  (if (and (> (len miles) u0) (<= (len miles) u10))
      (ok true)
      (err ERR-INVALID-MILESTONES))
)

(define-private (validate-timestamp (ts uint))
  (if (>= ts block-height)
      (ok true)
      (err ERR-INVALID-TIMESTAMP))
)

(define-private (validate-voting-period (start uint) (end uint))
  (if (and (> start block-height) (> end start))
      (ok true)
      (err ERR-INVALID-VOTING_PERIOD))
)

(define-private (validate-quorum (q uint))
  (if (and (> q u0) (<= q u100))
      (ok true)
      (err ERR-INVALID-QUORUM))
)

(define-private (validate-environment-impact (impact (string-ascii 500)))
  (if (<= (len impact) u500)
      (ok true)
      (err ERR-INVALID-ENVIRONMENT_IMPACT))
)

(define-private (validate-cost-breakdown (breakdown (string-ascii 500)))
  (if (<= (len breakdown) u500)
      (ok true)
      (err ERR-INVALID-COST_BREAKDOWN))
)

(define-private (validate-risk-assessment (risk (string-ascii 500)))
  (if (<= (len risk) u500)
      (ok true)
      (err ERR-INVALID-RISK_ASSESSMENT))
)

(define-private (validate-team-details (team (string-ascii 500)))
  (if (<= (len team) u500)
      (ok true)
      (err ERR-INVALID-TEAM_DETAILS))
)

(define-private (validate-principal (p principal))
  (if (not (is-eq p 'SP000000000000000000002Q6VF78))
      (ok true)
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-authority-contract (contract-principal principal))
  (begin
    (try! (validate-principal contract-principal))
    (asserts! (is-none (var-get authority-contract)) (err ERR-AUTHORITY-NOT-VERIFIED))
    (var-set authority-contract (some contract-principal))
    (ok true)
  )
)

(define-public (set-max-proposals (new-max uint))
  (begin
    (asserts! (> new-max u0) (err ERR-MAX-PROPOSALS_EXCEEDED))
    (asserts! (is-some (var-get authority-contract)) (err ERR-AUTHORITY-NOT-VERIFIED))
    (var-set max-proposals new-max)
    (ok true)
  )
)

(define-public (set-proposal-fee (new-fee uint))
  (begin
    (asserts! (>= new-fee u0) (err ERR-INVALID-UPDATE-PARAM))
    (asserts! (is-some (var-get authority-contract)) (err ERR-AUTHORITY-NOT-VERIFIED))
    (var-set proposal-fee new-fee)
    (ok true)
  )
)

(define-public (create-proposal
  (title (string-ascii 100))
  (description (string-ascii 1000))
  (funding-goal uint)
  (duration uint)
  (project-type (string-ascii 50))
  (location (string-ascii 100))
  (milestones (list 10 (string-ascii 200)))
  (voting-start uint)
  (voting-end uint)
  (quorum uint)
  (environment-impact (string-ascii 500))
  (cost-breakdown (string-ascii 500))
  (risk-assessment (string-ascii 500))
  (team-details (string-ascii 500))
)
  (let (
        (next-id (var-get next-proposal-id))
        (current-max (var-get max-proposals))
        (authority (var-get authority-contract))
      )
    (asserts! (< next-id current-max) (err ERR-MAX-PROPOSALS_EXCEEDED))
    (try! (validate-title title))
    (try! (validate-description description))
    (try! (validate-funding-goal funding-goal))
    (try! (validate-duration duration))
    (try! (validate-project-type project-type))
    (try! (validate-location location))
    (try! (validate-milestones milestones))
    (try! (validate-voting-period voting-start voting-end))
    (try! (validate-quorum quorum))
    (try! (validate-environment-impact environment-impact))
    (try! (validate-cost-breakdown cost-breakdown))
    (try! (validate-risk-assessment risk-assessment))
    (try! (validate-team-details team-details))
    (asserts! (is-none (map-get? proposals-by-title title)) (err ERR-PROPOSAL-ALREADY-EXISTS))
    (let ((authority-recipient (unwrap! authority (err ERR-AUTHORITY-NOT-VERIFIED))))
      (try! (stx-transfer? (var-get proposal-fee) tx-sender authority-recipient))
    )
    (map-set proposals next-id
      {
        title: title,
        description: description,
        funding-goal: funding-goal,
        duration: duration,
        project-type: project-type,
        location: location,
        milestones: milestones,
        timestamp: block-height,
        proposer: tx-sender,
        status: "pending",
        voting-start: voting-start,
        voting-end: voting-end,
        quorum: quorum,
        environment-impact: environment-impact,
        cost-breakdown: cost-breakdown,
        risk-assessment: risk-assessment,
        team-details: team-details
      }
    )
    (map-set proposals-by-title title next-id)
    (var-set next-proposal-id (+ next-id u1))
    (print { event: "proposal-created", id: next-id })
    (ok next-id)
  )
)

(define-public (update-proposal
  (proposal-id uint)
  (update-title (string-ascii 100))
  (update-description (string-ascii 1000))
  (update-funding-goal uint)
)
  (let ((proposal (map-get? proposals proposal-id)))
    (match proposal
      p
        (begin
          (asserts! (is-eq (get proposer p) tx-sender) (err ERR-NOT-AUTHORIZED))
          (try! (validate-title update-title))
          (try! (validate-description update-description))
          (try! (validate-funding-goal update-funding-goal))
          (let ((existing (map-get? proposals-by-title update-title)))
            (match existing
              existing-id
                (asserts! (is-eq existing-id proposal-id) (err ERR-PROPOSAL-ALREADY-EXISTS))
              (begin true)
            )
          )
          (let ((old-title (get title p)))
            (if (is-eq old-title update-title)
                (ok true)
                (begin
                  (map-delete proposals-by-title old-title)
                  (map-set proposals-by-title update-title proposal-id)
                  (ok true)
                )
            )
          )
          (map-set proposals proposal-id
            {
              title: update-title,
              description: update-description,
              funding-goal: update-funding-goal,
              duration: (get duration p),
              project-type: (get project-type p),
              location: (get location p),
              milestones: (get milestones p),
              timestamp: block-height,
              proposer: (get proposer p),
              status: (get status p),
              voting-start: (get voting-start p),
              voting-end: (get voting-end p),
              quorum: (get quorum p),
              environment-impact: (get environment-impact p),
              cost-breakdown: (get cost-breakdown p),
              risk-assessment: (get risk-assessment p),
              team-details: (get team-details p)
            }
          )
          (map-set proposal-updates proposal-id
            {
              update-title: update-title,
              update-description: update-description,
              update-funding-goal: update-funding-goal,
              update-timestamp: block-height,
              updater: tx-sender
            }
          )
          (print { event: "proposal-updated", id: proposal-id })
          (ok true)
        )
      (err ERR-PROPOSAL-NOT-FOUND)
    )
  )
)

(define-public (get-proposal-count)
  (ok (var-get next-proposal-id))
)

(define-public (check-proposal-existence (title (string-ascii 100)))
  (ok (is-proposal-registered title))
)