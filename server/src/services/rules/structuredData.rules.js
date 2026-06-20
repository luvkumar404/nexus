import { makeRules } from './ruleFactory.js';

export const structuredDataRules = makeRules('structured-data', [
  'schema-present',
  'schema-valid',
  'schema-type-exists',
  'schema-required-fields',
  'schema-article',
  'schema-breadcrumblist',
  'schema-faqpage',
  'schema-localbusiness',
  'schema-organization',
  'schema-product',
  'schema-review',
  'schema-videoobject',
  'schema-website-searchaction'
]);
