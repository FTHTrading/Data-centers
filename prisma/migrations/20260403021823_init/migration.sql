-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ANALYST', 'ENGINEERING', 'POWER_ENGINEER', 'NETWORK_ENGINEER', 'COMPLIANCE', 'FINANCE', 'EXECUTIVE_REVIEWER', 'EXTERNAL_PARTNER', 'AI_AGENT_SUPERVISOR');

-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('INTAKE', 'SCREENING', 'IN_REVIEW', 'SHORTLISTED', 'IN_DILIGENCE', 'APPROVED', 'REJECTED', 'WATCHLIST', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SiteStage" AS ENUM ('SOURCING', 'QUALIFICATION', 'INITIAL_REVIEW', 'TECHNICAL_REVIEW', 'FINANCIAL_REVIEW', 'COMPLIANCE_REVIEW', 'EXECUTIVE_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('RETROFIT', 'GREENFIELD', 'POWERED_SHELL', 'OPERATING_FACILITY', 'LAND_ONLY', 'CAMPUS_EXPANSION', 'CARRIER_HOTEL', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "OwnershipStatus" AS ENUM ('OWN', 'LEASE', 'GROUND_LEASE', 'LOI', 'UNDER_CONTRACT', 'MARKETED', 'OFF_MARKET');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('SCRAPE', 'BROKER_SUBMISSION', 'MANUAL_ENTRY', 'AGENT_DISCOVERY', 'PARTNER_REFERRAL', 'EMAIL_INTAKE', 'COLD_OUTREACH');

-- CreateEnum
CREATE TYPE "SitePriority" AS ENUM ('CRITICAL', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "CoolingType" AS ENUM ('AIR', 'WATER', 'HYBRID', 'DIRECT_LIQUID', 'IMMERSION_SINGLE_PHASE', 'IMMERSION_TWO_PHASE', 'REAR_DOOR');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('BROKER', 'OWNER', 'UTILITY_CONTACT', 'LEGAL', 'ENGINEER', 'LENDER', 'PARTNER', 'OTHER');

-- CreateEnum
CREATE TYPE "AttachmentCategory" AS ENUM ('UTILITY_LETTER', 'LEASE_DOC', 'ENGINEERING_REPORT', 'ONE_LINE_DIAGRAM', 'VENDOR_QUOTE', 'COMPLIANCE_DOC', 'SITE_SURVEY', 'BROKER_PACKAGE', 'ENVIRONMENTAL', 'FINANCIAL', 'PHOTOS', 'ICM_MEMO', 'OTHER');

-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'EXTRACTED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "FactReviewStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "ReviewNoteType" AS ENUM ('COMMENT', 'FLAG', 'QUESTION', 'VERIFICATION', 'CAVEAT', 'REQUIREMENT');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('POWER_UTILITY', 'COOLING_THERMAL', 'NETWORK_CONNECTIVITY', 'STRUCTURAL', 'ENVIRONMENTAL_CLIMATE', 'COMPLIANCE_REGULATORY', 'COMMERCIAL_FINANCIAL', 'OPERATIONAL', 'JURISDICTIONAL', 'LEASE_OWNERSHIP', 'DATA_QUALITY', 'SECURITY');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');

-- CreateEnum
CREATE TYPE "SiteRecommendation" AS ENUM ('REJECT', 'WATCHLIST', 'STANDARD_FIT', 'STRATEGIC_FIT', 'FLAGSHIP_FIT');

-- CreateEnum
CREATE TYPE "SourceRegistryType" AS ENUM ('LISTING_SITE', 'BROKER_PAGE', 'MARKETPLACE', 'UTILITY_PAGE', 'GOVERNMENT_DATA', 'DEVELOPMENT_AUTHORITY', 'CARRIER_HOTEL', 'GIS_DATA', 'MANUAL');

-- CreateEnum
CREATE TYPE "ScrapeJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RawListingStatus" AS ENUM ('PENDING', 'PROCESSING', 'NORMALIZED', 'DUPLICATE', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('APPROVED', 'REJECTED', 'CONDITIONAL', 'DEFERRED', 'NEEDS_MORE_INFO');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('INTAKE', 'DOCUMENT_EXTRACTION', 'VALIDATION', 'POWER_UTILITY', 'COOLING_AI_READINESS', 'NETWORK', 'COMPLIANCE', 'RISK', 'FINANCIAL_MODELING', 'SUMMARY', 'WORKFLOW_ORCHESTRATOR', 'APPROVAL', 'KNOWLEDGE', 'PORTFOLIO_INTELLIGENCE', 'MARKET_SCOUT', 'LISTING_EXTRACTION', 'GEO_ENRICHMENT');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'AWAITING_REVIEW');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('REVIEW_SECTION', 'UPLOAD_DOCUMENT', 'VALIDATE_DATA', 'AGENT_RUN', 'FOLLOW_UP_BROKER', 'ESCALATE', 'APPROVE', 'TECHNICAL_REVIEW', 'LEGAL_REVIEW', 'FINANCIAL_REVIEW', 'COMPLIANCE_REVIEW', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TASK_ASSIGNED', 'TASK_DUE', 'TASK_OVERDUE', 'AGENT_COMPLETE', 'RISK_DETECTED', 'APPROVAL_REQUIRED', 'SITE_UPDATED', 'DOCUMENT_UPLOADED', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ANALYST',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "SiteStatus" NOT NULL DEFAULT 'INTAKE',
    "stage" "SiteStage" NOT NULL DEFAULT 'SOURCING',
    "siteType" "SiteType",
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "jurisdiction" TEXT,
    "zoning" TEXT,
    "parcelIds" TEXT,
    "ownershipStatus" "OwnershipStatus",
    "totalAcres" DOUBLE PRECISION,
    "laydownAcres" DOUBLE PRECISION,
    "totalSqFt" DOUBLE PRECISION,
    "currentItMW" DOUBLE PRECISION,
    "targetItMW" DOUBLE PRECISION,
    "maxExpandableMW" DOUBLE PRECISION,
    "currentPUE" DOUBLE PRECISION,
    "targetPUE" DOUBLE PRECISION,
    "isStandalone" BOOLEAN,
    "isOnCampus" BOOLEAN,
    "sourceType" "SourceType",
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "brokerName" TEXT,
    "listingDate" TIMESTAMP(3),
    "totalScore" DOUBLE PRECISION,
    "recommendation" "SiteRecommendation",
    "scorecardId" TEXT,
    "completenessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "criticalMissingFields" TEXT,
    "createdById" TEXT NOT NULL,
    "priority" "SitePriority" NOT NULL DEFAULT 'NORMAL',
    "tags" TEXT[],
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT,
    "yearBuilt" INTEGER,
    "totalSqFt" DOUBLE PRECISION,
    "raisedFloorSqFt" DOUBLE PRECISION,
    "raisedFloorHeightIn" DOUBLE PRECISION,
    "officeSqFt" DOUBLE PRECISION,
    "ancillarySqFt" DOUBLE PRECISION,
    "isPurposeBuilt" BOOLEAN,
    "isMultiStory" BOOLEAN,
    "floorLoadingPsf" DOUBLE PRECISION,
    "slabStrength" TEXT,
    "roofCondition" TEXT,
    "ceilingHeightFt" DOUBLE PRECISION,
    "windRatingMph" DOUBLE PRECISION,
    "seismicZone" TEXT,
    "floodZone" TEXT,
    "fireRiskLevel" TEXT,
    "loadingDocks" INTEGER,
    "stagingAreaSqFt" DOUBLE PRECISION,
    "parkingSpaces" INTEGER,
    "expansionPotential" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilities" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "provider" TEXT,
    "accountNumber" TEXT,
    "serviceVoltageKv" DOUBLE PRECISION,
    "deliveredMW" DOUBLE PRECISION,
    "contractedMW" DOUBLE PRECISION,
    "expandableMW" DOUBLE PRECISION,
    "feedCount" INTEGER,
    "hasFeedDiversity" BOOLEAN,
    "substationCount" INTEGER,
    "substationProximityMiles" DOUBLE PRECISION,
    "interconnectionStatus" TEXT,
    "energizationDate" TIMESTAMP(3),
    "upgradeRequired" BOOLEAN,
    "upgradeDescription" TEXT,
    "upgradeTimeline" TEXT,
    "gridReliabilityPercent" DOUBLE PRECISION,
    "voltageStabilityPercent" DOUBLE PRECISION,
    "hasBtmGeneration" BOOLEAN,
    "btmCapacityMW" DOUBLE PRECISION,
    "btmSources" TEXT,
    "notes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "substations" (
    "id" TEXT NOT NULL,
    "utilityId" TEXT NOT NULL,
    "name" TEXT,
    "capacityMW" DOUBLE PRECISION,
    "distanceMiles" DOUBLE PRECISION,
    "voltageKv" DOUBLE PRECISION,
    "isSinglePoint" BOOLEAN,
    "upgradeNeeded" BOOLEAN,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "substations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generator_plants" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "count" INTEGER,
    "fuelType" TEXT,
    "capacityKwEach" DOUBLE PRECISION,
    "redundancyModel" TEXT,
    "autonomyHours" DOUBLE PRECISION,
    "hasRefuelContract" BOOLEAN,
    "testSchedule" TEXT,
    "yearInstalled" INTEGER,
    "estimatedLifeYears" INTEGER,
    "emissionsNotes" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generator_plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ups_systems" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "topology" TEXT,
    "manufacturer" TEXT,
    "chemistry" TEXT,
    "capacityKwEach" DOUBLE PRECISION,
    "count" INTEGER,
    "runtimeMinutes" DOUBLE PRECISION,
    "redundancyModel" TEXT,
    "yearInstalled" INTEGER,
    "replacementCycleYears" INTEGER,
    "totalKwBacked" DOUBLE PRECISION,
    "currentKwUtilized" DOUBLE PRECISION,
    "supportedRackDensityKw" DOUBLE PRECISION,
    "strandedPowerKw" DOUBLE PRECISION,
    "hasTelemetry" BOOLEAN,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ups_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cooling_systems" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "coolingType" "CoolingType",
    "aggregateTons" DOUBLE PRECISION,
    "chilledWaterTons" DOUBLE PRECISION,
    "condenserTons" DOUBLE PRECISION,
    "crahCracCount" INTEGER,
    "redundancyModel" TEXT,
    "isLiquidCoolingReady" BOOLEAN,
    "hasInRowCooling" BOOLEAN,
    "hasRearDoorCooler" BOOLEAN,
    "hasCdu" BOOLEAN,
    "hasImmersionCooling" BOOLEAN,
    "hasWarmWaterLoop" BOOLEAN,
    "hasHeatReuse" BOOLEAN,
    "maxRackKwSupported" DOUBLE PRECISION,
    "pueDesign" DOUBLE PRECISION,
    "pueAnnual" DOUBLE PRECISION,
    "pueTarget" DOUBLE PRECISION,
    "wueValue" DOUBLE PRECISION,
    "waterSourceRisk" TEXT,
    "waterUseIntensity" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cooling_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "network_profiles" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "carriersOnSite" INTEGER,
    "carriersNearby" INTEGER,
    "hasDarkFiber" BOOLEAN,
    "hasMeetMeRoom" BOOLEAN,
    "hasRouteDiversity" BOOLEAN,
    "aggregateBandwidthTbps" DOUBLE PRECISION,
    "ixProximityMiles" DOUBLE PRECISION,
    "cloudOnRampLatencyMs" DOUBLE PRECISION,
    "crossConnectLeadTimeDays" INTEGER,
    "hasWavelengthService" BOOLEAN,
    "carrierNames" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiber_routes" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "networkProfileId" TEXT,
    "provider" TEXT,
    "routeType" TEXT,
    "isLit" BOOLEAN,
    "bandwidthGbps" DOUBLE PRECISION,
    "diverseFrom" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiber_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_profiles" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "hasPerimeterGuards" BOOLEAN,
    "guardsSchedule" TEXT,
    "hasCctvBuilding" BOOLEAN,
    "hasCctvDataCenter" BOOLEAN,
    "cctvRetentionDays" INTEGER,
    "hasMantraps" BOOLEAN,
    "hasBiometrics" BOOLEAN,
    "biometricMethod" TEXT,
    "buildingAuthMethod" TEXT,
    "datacenterAuthMethod" TEXT,
    "hasVisitorMgmt" BOOLEAN,
    "hasSocNoc" BOOLEAN,
    "hasAntiTailgating" BOOLEAN,
    "hasCabinetLocks" BOOLEAN,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_profiles" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "hasSoc1" BOOLEAN NOT NULL DEFAULT false,
    "hasSoc2" BOOLEAN NOT NULL DEFAULT false,
    "hasSoc3" BOOLEAN NOT NULL DEFAULT false,
    "hasIso27001" BOOLEAN NOT NULL DEFAULT false,
    "hasPciDss" BOOLEAN NOT NULL DEFAULT false,
    "hasHipaa" BOOLEAN NOT NULL DEFAULT false,
    "hasFedRamp" BOOLEAN NOT NULL DEFAULT false,
    "hasCjis" BOOLEAN NOT NULL DEFAULT false,
    "hasIso50001" BOOLEAN NOT NULL DEFAULT false,
    "hasNist" BOOLEAN NOT NULL DEFAULT false,
    "hasStatemssp" BOOLEAN NOT NULL DEFAULT false,
    "uptimeTier" TEXT,
    "financialInfraSuitable" BOOLEAN,
    "sovereignSuitable" BOOLEAN,
    "digitalAssetSuitable" BOOLEAN,
    "dataResidencyNotes" TEXT,
    "certificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_profiles" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "renewableEnergyPercent" DOUBLE PRECISION,
    "hasPpa" BOOLEAN,
    "ppaTermYears" INTEGER,
    "ppaPricePerKwh" DOUBLE PRECISION,
    "hasBtmGeneration" BOOLEAN,
    "hasMicrogrid" BOOLEAN,
    "carbonMetricTons" DOUBLE PRECISION,
    "ghgScope1" DOUBLE PRECISION,
    "ghgScope2Market" DOUBLE PRECISION,
    "waterStressLevel" TEXT,
    "floodRisk" TEXT,
    "fireRisk" TEXT,
    "seismicRisk" TEXT,
    "climateRiskNarrative" TEXT,
    "hasEsReporting" BOOLEAN,
    "insuranceComplexity" TEXT,
    "permittingRisk" TEXT,
    "communityRisk" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environmental_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capital_plans" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "totalProjectCostM" DOUBLE PRECISION,
    "siteControlCostM" DOUBLE PRECISION,
    "buildoutCostPerMwM" DOUBLE PRECISION,
    "retrofitCostM" DOUBLE PRECISION,
    "coolingRetrofitCostM" DOUBLE PRECISION,
    "securityUpliftCostM" DOUBLE PRECISION,
    "utilityDepositM" DOUBLE PRECISION,
    "seniorDebtM" DOUBLE PRECISION,
    "mezzDebtM" DOUBLE PRECISION,
    "preferredEquityM" DOUBLE PRECISION,
    "commonEquityM" DOUBLE PRECISION,
    "targetDscr" DOUBLE PRECISION,
    "targetLtv" DOUBLE PRECISION,
    "targetIrrUnlevered" DOUBLE PRECISION,
    "targetIrrLevered" DOUBLE PRECISION,
    "ppaAnnualCostM" DOUBLE PRECISION,
    "gridAnnualCostM" DOUBLE PRECISION,
    "readinessForLenders" TEXT,
    "tokenizationStrategy" TEXT,
    "rwaTokenTicker" TEXT,
    "rwaChain" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capital_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_models" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "scenarioType" TEXT,
    "revenuePerMwAnnualM" DOUBLE PRECISION,
    "noiMarginPercent" DOUBLE PRECISION,
    "ebitdaM" DOUBLE PRECISION,
    "paybackYears" DOUBLE PRECISION,
    "cashOnCashPercent" DOUBLE PRECISION,
    "assumptions" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurisdiction_profiles" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "county" TEXT,
    "municipality" TEXT,
    "hasTaxAbatement" BOOLEAN,
    "taxAbatementDetails" TEXT,
    "hasSalesTaxExemption" BOOLEAN,
    "hasPropertyTaxExemption" BOOLEAN,
    "enterpriseZone" BOOLEAN,
    "dataCenterIncentive" BOOLEAN,
    "politicalRisk" TEXT,
    "cryptoFriendly" BOOLEAN,
    "financialRegsNotes" TEXT,
    "speStructure" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jurisdiction_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expansion_plans" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "targetMW" DOUBLE PRECISION,
    "additionalSqFt" DOUBLE PRECISION,
    "additionalAcres" DOUBLE PRECISION,
    "estimatedCostM" DOUBLE PRECISION,
    "targetDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expansion_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactType" "ContactType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "storageKey" TEXT NOT NULL,
    "description" TEXT,
    "category" "AttachmentCategory" NOT NULL,
    "processingStatus" "AttachmentStatus" NOT NULL DEFAULT 'PENDING',
    "processingError" TEXT,
    "extractedFactsCount" INTEGER NOT NULL DEFAULT 0,
    "uploadedById" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_facts" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "attachmentId" TEXT,
    "agentRunId" TEXT,
    "fieldPath" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "extractedValue" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "isInferred" BOOLEAN NOT NULL DEFAULT false,
    "evidenceSnippet" TEXT,
    "sourceType" TEXT,
    "appliedToSite" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" "FactReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extracted_facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_notes" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "fieldPath" TEXT,
    "section" TEXT,
    "content" TEXT NOT NULL,
    "noteType" "ReviewNoteType" NOT NULL DEFAULT 'COMMENT',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_flags" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "category" "RiskCategory" NOT NULL,
    "severity" "RiskSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "recommendation" TEXT,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "agentRunId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scorecards" (
    "id" TEXT NOT NULL,
    "strategicFit" DOUBLE PRECISION,
    "powerExpandability" DOUBLE PRECISION,
    "coolingAiReadiness" DOUBLE PRECISION,
    "networkLatency" DOUBLE PRECISION,
    "resilienceSecurity" DOUBLE PRECISION,
    "complianceSovereignty" DOUBLE PRECISION,
    "operationalMaturity" DOUBLE PRECISION,
    "financialAttractiveness" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "recommendation" "SiteRecommendation",
    "rationale" TEXT,
    "keyStrengths" TEXT,
    "keyWeaknesses" TEXT,
    "verifiedFieldCount" INTEGER NOT NULL DEFAULT 0,
    "totalFieldCount" INTEGER NOT NULL DEFAULT 0,
    "missingCriticalFields" TEXT,
    "computedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_registries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "SourceRegistryType" NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "scrapePattern" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scrapeFrequencyHours" INTEGER,
    "lastScrapedAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "totalScraped" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_registries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_jobs" (
    "id" TEXT NOT NULL,
    "registryId" TEXT NOT NULL,
    "status" "ScrapeJobStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "urlsDiscovered" INTEGER NOT NULL DEFAULT 0,
    "listingsExtracted" INTEGER NOT NULL DEFAULT 0,
    "duplicatesFound" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scrape_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raw_listings" (
    "id" TEXT NOT NULL,
    "scrapeJobId" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawContent" TEXT,
    "status" "RawListingStatus" NOT NULL DEFAULT 'PENDING',
    "normalizedSiteId" TEXT,
    "extractedData" JSONB,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_decisions" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "stage" "SiteStage" NOT NULL,
    "decision" "ApprovalStatus" NOT NULL,
    "rationale" TEXT,
    "conditions" TEXT,
    "unresolvedBlockers" TEXT,
    "decidedById" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "attachmentId" TEXT,
    "agentType" "AgentType" NOT NULL,
    "status" "AgentRunStatus" NOT NULL DEFAULT 'QUEUED',
    "inputPayload" JSONB,
    "outputPayload" JSONB,
    "summary" TEXT,
    "error" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "factsExtracted" INTEGER NOT NULL DEFAULT 0,
    "risksDetected" INTEGER NOT NULL DEFAULT 0,
    "triggeredById" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_recommendations" (
    "id" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence" TEXT,
    "isInferred" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_tasks" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "TaskType" NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "ownerId" TEXT,
    "dueDate" TIMESTAMP(3),
    "slaHours" INTEGER,
    "completedAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "agentRunId" TEXT,
    "dependsOnId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "siteId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "siteId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_comparisons" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "siteAId" TEXT NOT NULL,
    "siteBId" TEXT NOT NULL,
    "comparisonData" JSONB,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sites_slug_key" ON "sites"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sites_scorecardId_key" ON "sites"("scorecardId");

-- CreateIndex
CREATE UNIQUE INDEX "security_profiles_siteId_key" ON "security_profiles"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_profiles_siteId_key" ON "compliance_profiles"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "environmental_profiles_siteId_key" ON "environmental_profiles"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "capital_plans_siteId_key" ON "capital_plans"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "jurisdiction_profiles_siteId_key" ON "jurisdiction_profiles"("siteId");

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "scorecards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilities" ADD CONSTRAINT "utilities_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substations" ADD CONSTRAINT "substations_utilityId_fkey" FOREIGN KEY ("utilityId") REFERENCES "utilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generator_plants" ADD CONSTRAINT "generator_plants_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ups_systems" ADD CONSTRAINT "ups_systems_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cooling_systems" ADD CONSTRAINT "cooling_systems_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "network_profiles" ADD CONSTRAINT "network_profiles_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiber_routes" ADD CONSTRAINT "fiber_routes_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiber_routes" ADD CONSTRAINT "fiber_routes_networkProfileId_fkey" FOREIGN KEY ("networkProfileId") REFERENCES "network_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_profiles" ADD CONSTRAINT "security_profiles_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_profiles" ADD CONSTRAINT "compliance_profiles_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_profiles" ADD CONSTRAINT "environmental_profiles_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capital_plans" ADD CONSTRAINT "capital_plans_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_models" ADD CONSTRAINT "financial_models_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jurisdiction_profiles" ADD CONSTRAINT "jurisdiction_profiles_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expansion_plans" ADD CONSTRAINT "expansion_plans_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_facts" ADD CONSTRAINT "extracted_facts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_facts" ADD CONSTRAINT "extracted_facts_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_facts" ADD CONSTRAINT "extracted_facts_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "agent_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_notes" ADD CONSTRAINT "review_notes_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_notes" ADD CONSTRAINT "review_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_flags" ADD CONSTRAINT "risk_flags_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrape_jobs" ADD CONSTRAINT "scrape_jobs_registryId_fkey" FOREIGN KEY ("registryId") REFERENCES "source_registries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raw_listings" ADD CONSTRAINT "raw_listings_scrapeJobId_fkey" FOREIGN KEY ("scrapeJobId") REFERENCES "scrape_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_recommendations" ADD CONSTRAINT "agent_recommendations_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "agent_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "workflow_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_comparisons" ADD CONSTRAINT "site_comparisons_siteAId_fkey" FOREIGN KEY ("siteAId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_comparisons" ADD CONSTRAINT "site_comparisons_siteBId_fkey" FOREIGN KEY ("siteBId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
