import { coreSeoRules } from '../services/rules/coreSeo.rules.js';
import { performanceRules } from '../services/rules/performance.rules.js';
import { linksRules } from '../services/rules/links.rules.js';
import { imagesRules } from '../services/rules/images.rules.js';
import { securityRules } from '../services/rules/security.rules.js';
import { technicalSeoRules } from '../services/rules/technicalSeo.rules.js';
import { crawlabilityRules } from '../services/rules/crawlability.rules.js';
import { structuredDataRules } from '../services/rules/structuredData.rules.js';
import { contentRules } from '../services/rules/content.rules.js';
import { javascriptRenderingRules } from '../services/rules/javascriptRendering.rules.js';
import { accessibilityRules } from '../services/rules/accessibility.rules.js';
import { socialRules } from '../services/rules/social.rules.js';
import { eeatRules } from '../services/rules/eeat.rules.js';
import { urlStructureRules } from '../services/rules/urlStructure.rules.js';
import { redirectsRules } from '../services/rules/redirects.rules.js';
import { mobileRules } from '../services/rules/mobile.rules.js';
import { internationalizationRules } from '../services/rules/internationalization.rules.js';
import { htmlValidationRules } from '../services/rules/htmlValidation.rules.js';
import { aiGeoReadinessRules } from '../services/rules/aiGeoReadiness.rules.js';
import { legalComplianceRules } from '../services/rules/legalCompliance.rules.js';

export const AUDIT_RULES = [
  ...coreSeoRules,
  ...performanceRules,
  ...linksRules,
  ...imagesRules,
  ...securityRules,
  ...technicalSeoRules,
  ...crawlabilityRules,
  ...structuredDataRules,
  ...contentRules,
  ...javascriptRenderingRules,
  ...accessibilityRules,
  ...socialRules,
  ...eeatRules,
  ...urlStructureRules,
  ...redirectsRules,
  ...mobileRules,
  ...internationalizationRules,
  ...htmlValidationRules,
  ...aiGeoReadinessRules,
  ...legalComplianceRules
];
