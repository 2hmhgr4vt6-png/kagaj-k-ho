/**
 * The procedure records themselves. See seed-data.ts for the research note
 * that governs what may appear here.
 */

import {
  AppointmentRequirement,
  ClaimBasis,
  ConfidenceLevel,
  ContentStatus,
  FeeKind,
  NoticeLevel,
  SourceType,
  VerificationStatus,
} from '@prisma/client'
import type { SeedProcedure, SeedSource } from './seed-data'

// ---------------------------------------------------------------------------
// 1. E-passport application within Nepal
//    Source: Department of Passports, "When applying for a passport in Nepal"
//    https://nepalpassport.gov.np/en/process/process-23  (read 2026-09-05)
// ---------------------------------------------------------------------------

const ePassport: SeedProcedure = {
  slug: 'e-passport',
  categorySlug: 'passport',
  lifeEventSlugs: ['going-abroad', 'employment'],
  titleNe: 'नेपालभित्रबाट इ-राहदानी (e-Passport) को आवेदन',
  titleEn: 'Applying for an e-passport from within Nepal',
  summaryNe:
    'नेपालभित्रबाट इ-राहदानीका लागि अनलाइन प्रि-इनरोलमेन्ट गरी, तोकिएको समयमा इनरोलमेन्ट केन्द्रमा सक्कल कागजात सहित उपस्थित हुनुपर्छ।',
  summaryEn:
    'To apply for an e-passport inside Nepal you complete an online pre-enrollment, then attend the enrolment centre at your booked time with the original documents.',
  eligibilityNe:
    'नेपाली नागरिकताको प्रमाणपत्र लिएका नेपाली नागरिक। १६ वर्ष मुनिका आवेदकले नागरिकताको सट्टामा नाबालक परिचयपत्र प्रयोग गर्न सक्छन् र थप कागजात आवश्यक पर्छ।',
  eligibilityEn:
    'Nepali citizens holding a citizenship certificate. Applicants under 16 may use a minor identity card in place of a citizenship certificate, and additional documents are required.',
  whereToApplyNe:
    'अनलाइन प्रि-इनरोलमेन्ट फारम भर्दा आवेदन दिने स्थान (इनरोलमेन्ट केन्द्र) आफैँले छान्नुपर्छ, र तोकिएको मिति र समयमा त्यहीँ उपस्थित हुनुपर्छ।',
  whereToApplyEn:
    'You choose your application location (enrolment centre) while filling in the online pre-enrollment form, and must attend that centre at the scheduled date and time.',
  notesNe:
    'हराएको वा चोरी भएको भनी जनाइएको राहदानी पछि फेला परे पनि यात्राका लागि प्रयोग गर्नु हुँदैन — राहदानी विभागको सूचना।\nअनलाइन फारम भर्दा अपलोड गरिने प्रत्येक स्क्यान गरिएको कागजात बढीमा ३०० KB को हुनुपर्छ।\nतल दिइएका दस्तुर राहदानी विभागको आधिकारिक दस्तुर पृष्ठबाट लिइएको हो। सो पृष्ठले यी दर “सामान्यतया” लागू हुने भनेको छ, त्यसैले रकम तिर्नुअघि पछिल्लो सूचना पुष्टि गर्नुहोस्।\nअनलाइन भुक्तानी द्रुत (expedited) सेवाका लागि मात्र हो; जिल्ला प्रशासन कार्यालयमार्फत साधारण सेवा लिने आवेदकले अनलाइन भुक्तानी गर्नु हुँदैन।',
  notesEn:
    'A passport reported as lost or stolen must not be used for travel even if it is later recovered — advisory from the Department of Passports.\nEach scanned document uploaded during the online form must be no larger than 300 KB.\nThe fees below are taken from the Department of Passports fee page, which describes them as the rates that "generally" apply — confirm the latest notice before paying.\nOnline payment is only for the expedited service; applicants using the regular service through a District Administration Office should not pay online.',
  // The Department of Passports process page states neither a processing time
  // nor a fee, so both are recorded as unverified rather than guessed.
  processingTimeNe: null,
  processingTimeEn: null,
  processingTimeBasis: ClaimBasis.UNKNOWN,
  appointmentRequirement: AppointmentRequirement.REQUIRED,
  appointmentNoteNe:
    'अनलाइन प्रि-इनरोलमेन्ट गर्दा नै मिति र समय बुक हुन्छ। छापिएको फारम (वा मोबाइलमा PDF) र सक्कल कागजात सहित तोकिएको समयमा पुग्नुपर्छ।',
  appointmentNoteEn:
    'The date and time are booked during online pre-enrollment. Attend at the scheduled time with the printed form (or the PDF on your phone) and the original documents.',
  appointmentUrl: 'https://online.nepalpassport.gov.np/',
  status: ContentStatus.PUBLISHED,
  verificationStatus: VerificationStatus.VERIFIED,
  confidence: ConfidenceLevel.HIGH,
  metaTitleNe: 'नेपालमा पासपोर्ट बनाउन के के चाहिन्छ? — आधिकारिक कागजात र प्रक्रिया',
  metaTitleEn: 'What documents do you need for a Nepali e-passport? Official list and steps',
  metaDescriptionNe:
    'राहदानी विभागको आधिकारिक पृष्ठअनुसार नेपालभित्रबाट इ-राहदानी बनाउन चाहिने कागजात, अनलाइन प्रि-इनरोलमेन्ट र इनरोलमेन्ट केन्द्रको प्रक्रिया।',
  metaDescriptionEn:
    'The documents, online pre-enrollment and enrolment-centre steps for a Nepali e-passport, as published by the Department of Passports.',
  aliases: [
    'passport', 'पासपोर्ट', 'राहदानी', 'e-passport', 'epassport', 'passport banaune',
    'passport banaune tarika', 'rahadani', 'नयाँ पासपोर्ट', 'passport renew',
    'mrp', 'passport nepal', 'पासपोर्ट बनाउने',
  ],
  officeSlugs: [
    {
      slug: 'department-of-passports',
      roleNe: 'केन्द्रीय निकाय',
      roleEn: 'Central issuing authority',
    },
  ],
  sources: [
    {
      key: 'dop-process-23',
      organization: 'Department of Passports, Ministry of Foreign Affairs, Government of Nepal',
      title: 'When applying for a passport in Nepal — required documents and process',
      url: 'https://nepalpassport.gov.np/en/process/process-23',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'The page lists required documents and the online pre-enrollment process. It states no fee amounts and no processing time, so neither is asserted on this record.',
    },
    {
      key: 'dop-home',
      organization: 'Department of Passports, Ministry of Foreign Affairs, Government of Nepal',
      title: 'Department of Passports — official homepage',
      url: 'https://nepalpassport.gov.np/en',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'Source for the office address, phone, email, published office hours (Mon–Fri 09:00–17:00) and the lost/stolen passport advisory.',
    },
    {
      key: 'dop-fees',
      organization: 'Department of Passports, Ministry of Foreign Affairs, Government of Nepal',
      title: 'राहदानीका लागि लाग्ने दस्तुर (Passport fees)',
      url: 'https://nepalpassport.gov.np/process/-41',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'The fee table on this page is captioned "राहदानी दस्तुर (राहदानी विभाग)" — the rates charged at the Department of Passports. The page itself hedges with "सामान्यतया" ("generally"), which is why the record carries a caveat note rather than presenting these as the only possible amounts.',
    },
    {
      key: 'dop-online-payment',
      organization: 'Department of Passports, Ministry of Foreign Affairs, Government of Nepal',
      title: 'Online Payment — Department of Passports',
      url: 'https://nepalpassport.gov.np/online-payment',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'States that online payment applies only to the expedited service, and that applicants using the regular service through a District Administration Office should not pay online.',
    },
  ],
  documents: [
    { slug: 'passport-application-form-barcode', isMandatory: true, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-process-23' },
    { slug: 'citizenship-certificate-original', isMandatory: true, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-process-23',
      conditionNe: 'सक्कल। १६ वर्ष मुनिका आवेदकका हकमा नाबालक परिचयपत्र।',
      conditionEn: 'Original. For applicants under 16, the minor identity card instead.' },
    { slug: 'minor-identity-card', isMandatory: false, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-process-23',
      conditionNe: '१६ वर्ष मुनिका आवेदकका लागि, नागरिकताको सट्टामा।',
      conditionEn: 'For applicants under 16, in place of the citizenship certificate.' },
    { slug: 'current-or-expired-passport', isMandatory: false, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-process-23',
      conditionNe: 'पहिले राहदानी लिइसकेको भए मात्र।',
      conditionEn: 'Only if a passport was previously held.' },
    { slug: 'national-id-card-or-number', isMandatory: true, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-process-23' },
    { slug: 'bank-voucher-or-cash-receipt', isMandatory: true, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-process-23',
      conditionNe: 'आवेदन दिनुअघि राजस्व बुझाएको हुनुपर्छ।',
      conditionEn: 'The revenue payment must be made before submitting the application.' },
    { slug: 'minor-card-district-verification', isMandatory: false, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-process-23',
      conditionNe: '१६ वर्ष मुनिका आवेदकका लागि।', conditionEn: 'For applicants under 16.' },
    { slug: 'parents-citizenship', isMandatory: false, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-process-23',
      conditionNe: '१६ वर्ष मुनिका आवेदकका लागि, बाबु/आमा वा संरक्षकको।',
      conditionEn: "For applicants under 16 — the parents' or guardian's certificate." },
  ],
  steps: [
    {
      titleNe: 'अनलाइन प्रि-इनरोलमेन्ट फारम भर्नुहोस्',
      titleEn: 'Complete the online pre-enrollment form',
      detailNe: 'राहदानी विभागको अनलाइन प्रणालीबाट फारम भर्न सुरु गर्नुहोस्।',
      detailEn: 'Start the form on the Department of Passports online system.',
      actionUrl: 'https://online.nepalpassport.gov.np/',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceKey: 'dop-process-23',
    },
    {
      titleNe: 'आवेदनको प्रकार छान्नुहोस्',
      titleEn: 'Select the application type',
      detailNe: 'नयाँ, नवीकरण, हराएको/चोरी भएको सट्टा, वा बिग्रिएको — मध्ये एक।',
      detailEn: 'New, renewal, replacement (lost/stolen), or damaged.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceKey: 'dop-process-23',
    },
    {
      titleNe: 'राहदानीको पृष्ठ संख्या छान्नुहोस्',
      titleEn: 'Choose the passport booklet length',
      detailNe: '३४ पृष्ठ वा ६६ पृष्ठ।',
      detailEn: '34-page or 66-page.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceKey: 'dop-process-23',
    },
    {
      titleNe: 'आवेदन दिने स्थान छान्नुहोस्',
      titleEn: 'Select the application location',
      detailNe: null,
      detailEn: null,
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceKey: 'dop-process-23',
    },
    {
      titleNe: 'स्क्यान गरिएका कागजात अपलोड गर्नुहोस्',
      titleEn: 'Upload the scanned documents',
      detailNe: 'प्रत्येक फाइल बढीमा ३०० KB को हुनुपर्छ।',
      detailEn: 'Each file must be a maximum of 300 KB.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceKey: 'dop-process-23',
    },
    {
      titleNe: 'सबै विवरण मिलेको छ कि छैन जाँच्नुहोस्',
      titleEn: 'Review every detail for accuracy',
      detailNe: null,
      detailEn: null,
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceKey: 'dop-process-23',
    },
    {
      titleNe: 'फारम डाउनलोड गरी प्रिन्ट गर्नुहोस्',
      titleEn: 'Download and print the form',
      detailNe: 'डिजिटल प्रति सुरक्षित राख्नुहोस् र छापिएको फारम लिएर जानुहोस्।',
      detailEn: 'Save the digital copy and take the printed form with you.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceKey: 'dop-process-23',
    },
    {
      titleNe: 'तोकिएको समयमा इनरोलमेन्ट केन्द्रमा उपस्थित हुनुहोस्',
      titleEn: 'Attend the enrolment centre at the scheduled time',
      detailNe: 'छापिएको फारम (वा मोबाइलमा PDF) र सक्कल कागजात सहित पुग्नुहोस्।',
      detailEn: 'Bring the printed form (or the PDF on your phone) together with the originals.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceKey: 'dop-process-23',
    },
  ],
  // Transcribed from the Department of Passports fee table, which is captioned
  // "राहदानी दस्तुर (राहदानी विभाग)". The 34-page and 66-page columns are stored
  // as separate rows because each is a distinct published amount.
  fees: [
    { labelNe: 'नयाँ / नवीकरण — ३४ पृष्ठ', labelEn: 'New / renewal — 34 pages',
      kind: FeeKind.APPLICATION, amountNpr: 12000,
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-fees' },
    { labelNe: 'नयाँ / नवीकरण — ६६ पृष्ठ', labelEn: 'New / renewal — 66 pages',
      kind: FeeKind.APPLICATION, amountNpr: 20000,
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-fees' },
    { labelNe: 'नयाँ / नवीकरण — ३४ पृष्ठ (१० वर्ष भन्दा कम उमेरका नाबालक)',
      labelEn: 'New / renewal — 34 pages (minors under 10)',
      kind: FeeKind.APPLICATION, amountNpr: 9500,
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-fees' },
    { labelNe: 'नयाँ / नवीकरण — ६६ पृष्ठ (१० वर्ष भन्दा कम उमेरका नाबालक)',
      labelEn: 'New / renewal — 66 pages (minors under 10)',
      kind: FeeKind.APPLICATION, amountNpr: 14500,
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-fees' },
    { labelNe: 'हराएको वा बिग्रिएको — ३४ पृष्ठ',
      labelEn: 'Lost or damaged — 34 pages',
      kind: FeeKind.DUPLICATE, amountNpr: 17000,
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-fees' },
    { labelNe: 'हराएको वा बिग्रिएको — ६६ पृष्ठ',
      labelEn: 'Lost or damaged — 66 pages',
      kind: FeeKind.DUPLICATE, amountNpr: 25000,
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-fees' },
    { labelNe: 'हराएको वा बिग्रिएको — ३४ पृष्ठ (१० वर्ष भन्दा कम उमेरका नाबालक)',
      labelEn: 'Lost or damaged — 34 pages (minors under 10)',
      kind: FeeKind.DUPLICATE, amountNpr: 14500,
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-fees' },
    { labelNe: 'हराएको वा बिग्रिएको — ६६ पृष्ठ (१० वर्ष भन्दा कम उमेरका नाबालक)',
      labelEn: 'Lost or damaged — 66 pages (minors under 10)',
      kind: FeeKind.DUPLICATE, amountNpr: 19500,
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-fees' },
    { labelNe: 'कार्यालयको गल्ती भएमा', labelEn: 'Where the office made the error',
      kind: FeeKind.OTHER, amountNpr: 0,
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'dop-fees' },
  ],
  faqs: [
    {
      questionNe: 'पासपोर्ट बनाउन कति पैसा लाग्छ?',
      questionEn: 'How much does a Nepali passport cost?',
      answerNe:
        'राहदानी विभागको आधिकारिक दस्तुर पृष्ठअनुसार नयाँ वा नवीकरणका लागि ३४ पृष्ठको रू. १२,०००/- र ६६ पृष्ठको रू. २०,०००/- लाग्छ। १० वर्ष भन्दा कम उमेरका नाबालकका लागि क्रमश: रू. ९,५००/- र रू. १४,५००/- छ। हराएको वा बिग्रिएको राहदानीको दस्तुर बढी हुन्छ, र कार्यालयको गल्ती भएमा नि:शुल्क हुन्छ। सो पृष्ठमा यी दर “सामान्यतया” लागू हुने भनी लेखिएको छ, त्यसैले कार्यालय जानुअघि पछिल्लो सूचना पुष्टि गर्नुहोस्।',
      answerEn:
        'According to the Department of Passports fee page, a new or renewed passport costs NPR 12,000 for 34 pages and NPR 20,000 for 66 pages. For minors under 10 the rates are NPR 9,500 and NPR 14,500. Lost or damaged passports cost more, and there is no charge where the office made the error. That page describes these rates as those that "generally" apply, so confirm the latest notice before visiting.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceUrl: 'https://nepalpassport.gov.np/process/-41',
    },
    {
      questionNe: 'के अनलाइन समय (appointment) लिनैपर्छ?',
      questionEn: 'Do I have to book an appointment online?',
      answerNe:
        'हो। आधिकारिक प्रक्रियाअनुसार पहिले अनलाइन प्रि-इनरोलमेन्ट गर्नुपर्छ र त्यहीँ मिति र समय बुक हुन्छ; त्यसपछि तोकिएको समयमा इनरोलमेन्ट केन्द्र जानुपर्छ।',
      answerEn:
        'Yes. The official process requires online pre-enrollment first, during which the date and time are booked; you then attend the enrolment centre at that scheduled time.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceUrl: 'https://nepalpassport.gov.np/en/process/process-23',
    },
    {
      questionNe: '१६ वर्ष मुनिका बालबालिकाका लागि के फरक हुन्छ?',
      questionEn: 'What is different for applicants under 16?',
      answerNe:
        'नागरिकताको सट्टामा नाबालक परिचयपत्र प्रयोग गर्न सकिन्छ, र थप रूपमा नाबालक परिचयपत्रको जिल्लाबाट भएको प्रमाणीकरण तथा बाबु/आमा वा संरक्षकको नागरिकता आवश्यक पर्छ।',
      answerEn:
        'A minor identity card may be used in place of a citizenship certificate, and in addition the district verification of that card and the citizenship documents of the parents or guardian are required.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceUrl: 'https://nepalpassport.gov.np/en/process/process-23',
    },
  ],
  notices: [
    {
      level: NoticeLevel.WARNING,
      titleNe: 'हराएको वा चोरी भएको राहदानी',
      titleEn: 'Lost or stolen passports',
      bodyNe:
        'हराएको वा चोरी भएको भनी जनाइएको राहदानी पछि फेला परे पनि यात्राका लागि प्रयोग गर्नु हुँदैन।',
      bodyEn:
        'A passport reported as lost or stolen must not be used for travel, even if it is later recovered.',
      sourceUrl: 'https://nepalpassport.gov.np/en',
    },
  ],
}

// ---------------------------------------------------------------------------
// 2. National Identity Card registration
//    Source: DoNIDCR FAQ — प्राय सोधिने प्रश्नहरु : राष्ट्रिय परिचयपत्र
//    https://donidcr.gov.np/pages/abboyed-asked-questions--rational-identity-10/
// ---------------------------------------------------------------------------

const nationalId: SeedProcedure = {
  slug: 'national-id-card',
  categorySlug: 'national-id',
  lifeEventSlugs: ['citizenship', 'employment'],
  titleNe: 'राष्ट्रिय परिचयपत्रको विवरण दर्ता',
  titleEn: 'Registering for the National Identity Card',
  summaryNe:
    'नागरिकता लिइसकेका १६ वर्ष पुगेका नेपाली नागरिकले विवरण दर्ता केन्द्रमा व्यक्तिगत तथा बायोमेट्रिक विवरण दर्ता गराई राष्ट्रिय परिचयपत्र नम्बर र कार्ड प्राप्त गर्न सक्छन्।',
  summaryEn:
    'Nepali citizens aged 16 or over who hold a citizenship certificate register their personal and biometric details at a registration station to obtain a National ID number and card.',
  eligibilityNe:
    '१६ वर्ष उमेर पूरा भई नेपाली नागरिकताको प्रमाणपत्र लिएका व्यक्तिले राष्ट्रिय परिचयपत्र प्राप्त गर्न सक्छन्।',
  eligibilityEn:
    'Any person who has completed 16 years of age and holds a Nepali citizenship certificate may obtain a National Identity Card.',
  whereToApplyNe:
    'जिल्ला प्रशासन कार्यालय, विवरण दर्ता केन्द्र रहेका इलाका प्रशासन कार्यालय, वा वडा स्तरमा सञ्चालन हुने राष्ट्रिय परिचयपत्र विवरण दर्ता शिविरमा।',
  whereToApplyEn:
    'At a District Administration Office, at an Area Administration Office that hosts a registration station, or at a ward-level National ID registration campaign.',
  notesNe:
    'सक्कल र स्पष्ट कागजात मात्र स्वीकार गरिन्छ — प्रतिलिपि वा केरमेट गरिएको कागजात मान्य हुँदैन।\nजिल्ला प्रशासन/इलाका प्रशासन कार्यालयमा दर्ता गराएमा नम्बर तत्कालै प्राप्त हुन्छ; वडा स्तरीय शिविरमा दर्ता गराएमा केही समयपछि SMS मार्फत नम्बर प्राप्त हुन्छ।',
  notesEn:
    'Only original, legible documents are accepted — photocopies and altered documents are not.\nAt a District or Area Administration Office the number is issued immediately; at a ward-level campaign it arrives later by SMS.',
  processingTimeNe: null,
  processingTimeEn: null,
  processingTimeBasis: ClaimBasis.UNKNOWN,
  appointmentRequirement: AppointmentRequirement.NOT_REQUIRED,
  appointmentNoteNe: null,
  appointmentNoteEn: null,
  appointmentUrl: 'https://citizenportal.donidcr.gov.np/',
  status: ContentStatus.PUBLISHED,
  verificationStatus: VerificationStatus.VERIFIED,
  confidence: ConfidenceLevel.HIGH,
  metaTitleNe: 'राष्ट्रिय परिचयपत्र बनाउन के के चाहिन्छ? — आधिकारिक कागजात र प्रक्रिया',
  metaTitleEn: 'National Identity Card in Nepal: documents, eligibility and process',
  metaDescriptionNe:
    'राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभागको आधिकारिक जानकारीअनुसार राष्ट्रिय परिचयपत्रका लागि चाहिने कागजात, योग्यता, दर्ता स्थान र दस्तुर।',
  metaDescriptionEn:
    'Documents, eligibility, where to register and fees for Nepal’s National Identity Card, as published by the Department of National ID and Civil Registration.',
  aliases: [
    'national id', 'nid', 'राष्ट्रिय परिचयपत्र', 'परिचयपत्र', 'national identity card',
    'rastriya parichaya patra', 'parichaya patra', 'nagarik parichaya patra', 'नेशनल आईडी',
  ],
  officeSlugs: [
    {
      slug: 'donidcr',
      roleNe: 'केन्द्रीय निकाय',
      roleEn: 'Central authority',
    },
  ],
  sources: [
    {
      key: 'donidcr-nid-faq',
      organization: 'Department of National ID and Civil Registration, Ministry of Home Affairs',
      title: 'प्राय सोधिने प्रश्नहरु : राष्ट्रिय परिचयपत्र (FAQ — National Identity Card)',
      url: 'https://donidcr.gov.np/pages/abboyed-asked-questions--rational-identity-10/',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'Source for eligibility (16+ with citizenship), required documents, registration locations, the fee position (card free; NPR 500 for a duplicate) and the registration steps.',
    },
    {
      key: 'donidcr-home',
      organization: 'Department of National ID and Civil Registration, Ministry of Home Affairs',
      title: 'Department of National ID and Civil Registration — official homepage',
      url: 'https://donidcr.gov.np/',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes: 'Departmental homepage; source for the toll-free number 1147 and the online NID application link.',
    },
  ],
  documents: [
    { slug: 'citizenship-certificate-original', isMandatory: true, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq',
      conditionNe: 'सक्कल प्रमाणपत्र। प्रतिलिपि वा केरमेट गरिएको मान्य हुँदैन।',
      conditionEn: 'The original certificate. Photocopies or altered documents are not accepted.' },
    { slug: 'proof-of-permanent-address', isMandatory: false, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq',
      conditionNe: 'नागरिकतामा उल्लेख भएको ठेगाना भन्दा हालको स्थायी ठेगाना फरक भएमा।',
      conditionEn: 'If the current permanent address differs from the one recorded on the citizenship certificate.' },
    { slug: 'marriage-registration-certificate', isMandatory: false, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq',
      conditionNe: 'विवाहित व्यक्तिका लागि।', conditionEn: 'For married applicants.' },
    { slug: 'birth-date-document', isMandatory: false, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq',
      conditionNe: 'नागरिकतामा जन्म मिति नखुलेको अवस्थामा।',
      conditionEn: 'Where the date of birth is not shown on the citizenship certificate.' },
  ],
  steps: [
    { titleNe: 'आवश्यक सक्कल कागजात तयार पार्नुहोस्', titleEn: 'Gather the required original documents',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq' },
    { titleNe: 'विवरण दर्ता केन्द्रमा जानुहोस्', titleEn: 'Visit a registration station',
      detailNe: 'जिल्ला प्रशासन कार्यालय, इलाका प्रशासन कार्यालय वा वडा स्तरीय शिविर।',
      detailEn: 'A District Administration Office, an Area Administration Office, or a ward-level campaign.',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq' },
    { titleNe: 'व्यक्तिगत तथा बायोमेट्रिक विवरण दर्ता गराउनुहोस्', titleEn: 'Submit your personal and biometric details',
      detailNe: 'औंठाछाप, आँखाको स्क्यान र फोटो लिइन्छ।',
      detailEn: 'Fingerprints, iris scan and photograph are captured.',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq' },
    { titleNe: '१० अंकको राष्ट्रिय परिचयपत्र नम्बर प्राप्त गर्नुहोस्', titleEn: 'Receive your 10-digit National ID number',
      detailNe: 'कार्यालयमा दर्ता गरेमा तत्कालै; वडा शिविरमा दर्ता गरेमा SMS मार्फत।',
      detailEn: 'Immediately when registering at an office; by SMS when registering at a ward campaign.',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq' },
    { titleNe: 'कार्ड छापिएपछि लिन जानुहोस्', titleEn: 'Collect the printed card',
      detailNe: 'कार्ड छापिएको सूचना आएपछि सम्बन्धित कार्यालयबाट लिनुहोस्।',
      detailEn: 'Collect it from the relevant office once you are notified that it has been printed.',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq' },
  ],
  fees: [
    { labelNe: 'राष्ट्रिय परिचयपत्र (पहिलो पटक)', labelEn: 'National Identity Card (first issue)',
      kind: FeeKind.APPLICATION, amountNpr: 0, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq' },
    { labelNe: 'प्रतिलिपि कार्ड', labelEn: 'Duplicate card',
      kind: FeeKind.DUPLICATE, amountNpr: 500,
      amountTextNe: 'रु. ५०० (नेपाल राष्ट्र बैंक मार्फत)',
      amountTextEn: 'NPR 500, paid through Nepal Rastra Bank',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-nid-faq' },
  ],
  faqs: [
    {
      questionNe: 'राष्ट्रिय परिचयपत्र बनाउन पैसा लाग्छ?',
      questionEn: 'Is there a fee for the National Identity Card?',
      answerNe:
        'विभागको आधिकारिक जानकारीअनुसार राष्ट्रिय परिचयपत्र आफैँमा नि:शुल्क हो। तर प्रतिलिपि कार्ड लिनुपरेमा नेपाल राष्ट्र बैंक मार्फत रु. ५०० तिर्नुपर्छ।',
      answerEn:
        'According to the department, the National Identity Card itself carries no fee. A replacement duplicate card, however, costs NPR 500, paid through Nepal Rastra Bank.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceUrl: 'https://donidcr.gov.np/pages/abboyed-asked-questions--rational-identity-10/',
    },
    {
      questionNe: 'कति वर्ष उमेर पुगेपछि बनाउन सकिन्छ?',
      questionEn: 'From what age can I register?',
      answerNe: '१६ वर्ष उमेर पूरा भई नेपाली नागरिकताको प्रमाणपत्र लिएपछि।',
      answerEn: 'Once you have completed 16 years of age and hold a Nepali citizenship certificate.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceUrl: 'https://donidcr.gov.np/pages/abboyed-asked-questions--rational-identity-10/',
    },
  ],
  notices: [],
}

// ---------------------------------------------------------------------------
// 3. Birth registration (personal event registration)
//    Source: DoNIDCR FAQ — प्राय सोधिने प्रश्नहरु : पञ्जीकरण
//    https://donidcr.gov.np/pages/about-frequently-asked-questions--registration-5/
// ---------------------------------------------------------------------------

const birthRegistration: SeedProcedure = {
  slug: 'birth-registration',
  categorySlug: 'birth-registration',
  lifeEventSlugs: ['birth'],
  titleNe: 'जन्म दर्ता (व्यक्तिगत घटना दर्ता)',
  titleEn: 'Birth registration (personal event registration)',
  summaryNe:
    'जन्म भएको ३५ दिनभित्र सम्बन्धित वडा कार्यालयमा नि:शुल्क जन्म दर्ता गराउन सकिन्छ; ३५ दिन नाघेमा बिलम्ब शुल्क लाग्छ।',
  summaryEn:
    'A birth can be registered free of charge at the relevant ward office within 35 days; after 35 days a late fee applies.',
  eligibilityNe:
    'सूचक (जन्म दर्ता गराउन आउने व्यक्ति) बाबु, आमा, वा १८ वर्ष उमेर पूरा भएको परिवारको सदस्य हुनुपर्छ। सूचकको नागरिकता आवश्यक पर्छ।',
  eligibilityEn:
    'The informant registering the birth must be the father, the mother, or a family member aged 18 or over. The informant must produce their own citizenship certificate.',
  whereToApplyNe:
    'स्थायी बसोबास रहेको स्थानको वडा कार्यालयमा, वा घटना घटेको स्थानको स्थानीय पञ्जीकरण कार्यालयमा।',
  whereToApplyEn:
    'At the ward office of the place of permanent residence, or at the local registration office where the event occurred.',
  notesNe:
    'आवश्यक कागजात घटनाको प्रकृतिअनुसार फरक पर्न सक्छ। जन्म स्वास्थ्य संस्थामा भएको भए सोही संस्थाको अभिलेख माग हुन सक्छ।\nप्रमाणपत्र लिनुअघि सबै विवरण ठीक छ कि छैन जाँच्नु सूचकको दायित्व हो।',
  notesEn:
    'The exact documents vary with the circumstances of the event; where the birth occurred in a health facility, that facility’s record may be required.\nIt is the informant’s duty to check every detail on the certificate before accepting it.',
  processingTimeNe: null,
  processingTimeEn: null,
  processingTimeBasis: ClaimBasis.UNKNOWN,
  appointmentRequirement: AppointmentRequirement.NOT_REQUIRED,
  appointmentNoteNe: null,
  appointmentNoteEn: null,
  appointmentUrl: null,
  status: ContentStatus.PUBLISHED,
  verificationStatus: VerificationStatus.VERIFIED,
  confidence: ConfidenceLevel.MEDIUM,
  metaTitleNe: 'जन्म दर्ता गर्न के के चाहिन्छ? ३५ दिनको नियम र वडा कार्यालयको प्रक्रिया',
  metaTitleEn: 'Birth registration in Nepal: the 35-day rule, documents and ward office process',
  metaDescriptionNe:
    'राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभागको आधिकारिक जानकारीअनुसार जन्म दर्ताको समयसीमा, सूचक, कागजात र बिलम्ब शुल्क।',
  metaDescriptionEn:
    'Deadlines, who may act as informant, required documents and the late fee for birth registration in Nepal, per the Department of National ID and Civil Registration.',
  aliases: [
    'birth registration', 'जन्म दर्ता', 'janma darta', 'birth certificate nepal',
    'जन्मदर्ता', 'janma darta praman patra', 'व्यक्तिगत घटना दर्ता', 'personal event registration',
  ],
  officeSlugs: [
    { slug: 'donidcr', roleNe: 'केन्द्रीय निकाय', roleEn: 'Central authority' },
  ],
  sources: [
    {
      key: 'donidcr-registration-faq',
      organization: 'Department of National ID and Civil Registration, Ministry of Home Affairs',
      title: 'प्राय सोधिने प्रश्नहरु : पञ्जीकरण (FAQ — Civil registration)',
      url: 'https://donidcr.gov.np/pages/about-frequently-asked-questions--registration-5/',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'Source for the 35-day free-registration window, the late fee, the registration location, who may act as informant, and the informant’s citizenship requirement.',
    },
    {
      key: 'donidcr-regulations-2077',
      organization: 'Department of National ID and Civil Registration, Ministry of Home Affairs',
      title: 'राष्ट्रिय परिचयपत्र तथा पञ्जीकरण नियमावली, २०७७',
      url: 'https://donidcr.gov.np/content/19/national-identity-card-and-registration-regulations--2077/',
      sourceType: SourceType.GAZETTE_OR_LAW,
      isPrimary: true,
      notes:
        'The governing regulation. Listed for reference only — individual claims on this record are cited to the departmental FAQ, not to this page. Note that this URL is a document-download stub: it serves ~75 characters of readable content inside a 43,000-character shell, so the automated drift detector reports it as THIN_CONTENT and it must be re-read by hand.',
    },
  ],
  documents: [
    { slug: 'informant-citizenship', isMandatory: true, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-registration-faq' },
    { slug: 'health-facility-birth-record', isMandatory: false, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-registration-faq',
      conditionNe: 'स्वास्थ्य संस्थामा जन्म भएको अवस्थामा।',
      conditionEn: 'Where the birth took place in a health facility.' },
  ],
  steps: [
    { titleNe: 'सूचक निर्धारण गर्नुहोस्', titleEn: 'Identify who will act as the informant',
      detailNe: 'बाबु, आमा वा १८ वर्ष पूरा भएको परिवारको सदस्य।',
      detailEn: 'The father, the mother, or a family member aged 18 or over.',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-registration-faq' },
    { titleNe: 'सम्बन्धित वडा कार्यालयमा जानुहोस्', titleEn: 'Go to the relevant ward office',
      detailNe: 'स्थायी बसोबासको वडा कार्यालय वा घटना घटेको स्थानको स्थानीय पञ्जीकरण कार्यालय।',
      detailEn: 'The ward office of permanent residence, or the local registration office where the event occurred.',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-registration-faq' },
    { titleNe: 'सूचना फाराम सही ढंगले भर्नुहोस्', titleEn: 'Fill in the information form correctly',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-registration-faq' },
    { titleNe: 'आवश्यक कागजात पेस गर्नुहोस्', titleEn: 'Submit the required documents',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-registration-faq' },
    { titleNe: 'प्रमाणपत्रको विवरण जाँचेर मात्र बुझ्नुहोस्', titleEn: 'Check the details on the certificate before accepting it',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-registration-faq' },
  ],
  fees: [
    { labelNe: '३५ दिनभित्रको दर्ता', labelEn: 'Registration within 35 days',
      kind: FeeKind.APPLICATION, amountNpr: 0, basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-registration-faq' },
    { labelNe: '३५ दिन नाघेपछिको बिलम्ब शुल्क', labelEn: 'Late fee after 35 days',
      kind: FeeKind.LATE, amountNpr: null,
      amountTextNe: 'बिलम्ब शुल्क लाग्छ — रकम वडा कार्यालयमा बुझ्नुहोस्।',
      amountTextEn: 'A late fee applies — confirm the amount with the ward office.',
      basis: ClaimBasis.OFFICIALLY_STATED, sourceKey: 'donidcr-registration-faq' },
  ],
  faqs: [
    {
      questionNe: 'जन्म दर्ता कति दिनभित्र गर्नुपर्छ?',
      questionEn: 'Within how many days must a birth be registered?',
      answerNe:
        'घटना भएको ३५ दिनभित्र नि:शुल्क दर्ता गराउन सकिन्छ। त्यसपछि बिलम्ब शुल्क तिरेर दर्ता गराउनुपर्छ।',
      answerEn:
        'Within 35 days of the event it can be registered free of charge. After that, registration requires payment of a late fee.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceUrl: 'https://donidcr.gov.np/pages/about-frequently-asked-questions--registration-5/',
    },
    {
      questionNe: 'को-को सूचक बन्न सक्छन्?',
      questionEn: 'Who can act as the informant?',
      answerNe: 'जन्मको हकमा बाबु, आमा, वा १८ वर्ष उमेर पूरा भएको परिवारको सदस्य।',
      answerEn: 'For a birth: the father, the mother, or a family member aged 18 or over.',
      basis: ClaimBasis.OFFICIALLY_STATED,
      sourceUrl: 'https://donidcr.gov.np/pages/about-frequently-asked-questions--registration-5/',
    },
  ],
  notices: [],
}

// ---------------------------------------------------------------------------
// Unpublished records.
//
// These exist so an editor can pick the fact-check up where research stopped.
// They carry the agency's official landing page as a source but assert no
// documents, no fees and no steps, and they are NOT published — so nothing
// unverified is ever shown to a reader.
// ---------------------------------------------------------------------------

function stub(input: {
  slug: string
  categorySlug: string
  lifeEventSlugs: string[]
  titleNe: string
  titleEn: string
  summaryNe: string
  summaryEn: string
  aliases: string[]
  source: SeedSource
}): SeedProcedure {
  return {
    slug: input.slug,
    categorySlug: input.categorySlug,
    lifeEventSlugs: input.lifeEventSlugs,
    titleNe: input.titleNe,
    titleEn: input.titleEn,
    summaryNe: input.summaryNe,
    summaryEn: input.summaryEn,
    eligibilityNe: null,
    eligibilityEn: null,
    whereToApplyNe: null,
    whereToApplyEn: null,
    notesNe: null,
    notesEn: null,
    processingTimeNe: null,
    processingTimeEn: null,
    processingTimeBasis: ClaimBasis.UNKNOWN,
    appointmentRequirement: AppointmentRequirement.UNKNOWN,
    appointmentNoteNe: null,
    appointmentNoteEn: null,
    appointmentUrl: null,
    // SOURCE_ATTACHED, not PUBLISHED: the agency page is on file, but nobody
    // has compared a requirement list against it yet.
    status: ContentStatus.SOURCE_ATTACHED,
    verificationStatus: VerificationStatus.NEEDS_VERIFICATION,
    confidence: ConfidenceLevel.LOW,
    aliases: input.aliases,
    officeSlugs: [],
    sources: [input.source],
    documents: [],
    steps: [],
    fees: [],
    faqs: [],
    notices: [],
  }
}

const stubs: SeedProcedure[] = [
  stub({
    slug: 'pan-registration',
    categorySlug: 'pan-tax',
    lifeEventSlugs: ['employment', 'tax', 'business'],
    titleNe: 'स्थायी लेखा नम्बर (PAN) दर्ता',
    titleEn: 'PAN (Permanent Account Number) registration',
    summaryNe: 'आन्तरिक राजस्व विभागबाट स्थायी लेखा नम्बर लिने प्रक्रिया।',
    summaryEn: 'Obtaining a Permanent Account Number from the Inland Revenue Department.',
    aliases: ['pan', 'pan card', 'पान', 'पान कार्ड', 'स्थायी लेखा नम्बर', 'pan number', 'pan registration'],
    source: {
      key: 'ird-home',
      organization: 'Inland Revenue Department, Ministry of Finance',
      title: 'Inland Revenue Department — official website',
      url: 'https://ird.gov.np/',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'Landing page only. At the time of research the department published PAN search and the taxpayer portal, but no single page setting out PAN registration requirements, so no requirements are asserted on this record.',
    },
  }),
  stub({
    slug: 'driving-licence',
    categorySlug: 'driving-licence',
    lifeEventSlugs: ['vehicle'],
    titleNe: 'सवारी चालक अनुमतिपत्र (लाइसेन्स)',
    titleEn: 'Driving licence',
    summaryNe: 'यातायात व्यवस्था विभागबाट सवारी चालक अनुमतिपत्र लिने प्रक्रिया।',
    summaryEn: 'Obtaining a driving licence from the Department of Transport Management.',
    aliases: ['driving licence', 'driving license', 'लाइसेन्स', 'सवारी चालक अनुमतिपत्र', 'license', 'licence', 'sawari chalak anumati patra'],
    source: {
      key: 'dotm-home',
      organization: 'Department of Transport Management, Ministry of Physical Infrastructure and Transport',
      title: 'Department of Transport Management — official website',
      url: 'https://www.dotm.gov.np/',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'Landing page only. The department publishes notices about the online EDLVRS system, but the requirement list could not be read from a stable official page during research.',
    },
  }),
  stub({
    slug: 'citizenship-certificate',
    categorySlug: 'citizenship',
    lifeEventSlugs: ['citizenship'],
    titleNe: 'नेपाली नागरिकताको प्रमाणपत्र',
    titleEn: 'Nepali citizenship certificate',
    summaryNe: 'जिल्ला प्रशासन कार्यालयबाट नेपाली नागरिकताको प्रमाणपत्र लिने प्रक्रिया।',
    summaryEn: 'Obtaining a Nepali citizenship certificate from the District Administration Office.',
    aliases: ['citizenship', 'नागरिकता', 'nagarikta', 'citizenship certificate', 'नागरिकता प्रमाणपत्र', 'nagarikta praman patra'],
    source: {
      key: 'moha-home',
      organization: 'Ministry of Home Affairs, Government of Nepal',
      title: 'Ministry of Home Affairs — official website',
      url: 'https://www.moha.gov.np/',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'Landing page only. Citizenship requirements are governed by the Nepal Citizenship Act and its amendments; the applicable provisions must be read and cited before this record is published.',
    },
  }),
  stub({
    slug: 'company-registration',
    categorySlug: 'company-registration',
    lifeEventSlugs: ['business'],
    titleNe: 'कम्पनी दर्ता',
    titleEn: 'Company registration',
    summaryNe: 'कम्पनी रजिस्ट्रारको कार्यालयमा कम्पनी दर्ता गर्ने प्रक्रिया।',
    summaryEn: 'Registering a company with the Office of the Company Registrar.',
    aliases: ['company registration', 'कम्पनी दर्ता', 'company darta', 'ocr', 'business registration', 'व्यवसाय दर्ता'],
    source: {
      key: 'ocr-home',
      organization: 'Office of the Company Registrar, Ministry of Industry, Commerce and Supplies',
      title: 'Office of the Company Registrar — official website',
      url: 'https://www.ocr.gov.np/',
      sourceType: SourceType.GOVERNMENT_AGENCY,
      isPrimary: true,
      notes:
        'Landing page only. The site was returning HTTP 503 during research, so no requirement, fee or step is asserted on this record.',
    },
  }),
]

export const procedures: SeedProcedure[] = [
  ePassport,
  nationalId,
  birthRegistration,
  ...stubs,
]

// ---------------------------------------------------------------------------
// Site-wide FAQs
// ---------------------------------------------------------------------------

export const siteFaqs = [
  {
    order: 1,
    questionNe: 'कागज के हो? सरकारी वेबसाइट हो?',
    questionEn: 'Is Kagaj K Ho? a government website?',
    answerNe:
      'होइन। कागज के हो? एक स्वतन्त्र सूचना प्लेटफर्म हो। यसले कुनै पनि सरकारी कार्यालयको प्रतिनिधित्व गर्दैन र कुनै आवेदन दर्ता वा स्वीकृत गर्न सक्दैन।',
    answerEn:
      'No. Kagaj K Ho? is an independent information platform. It does not represent any government office and cannot submit or approve any application.',
    basis: ClaimBasis.OFFICIALLY_STATED,
    sourceUrl: null,
  },
  {
    order: 2,
    questionNe: 'यहाँको जानकारी कहाँबाट आउँछ?',
    questionEn: 'Where does the information here come from?',
    answerNe:
      'प्रत्येक सेवा पृष्ठमा आधिकारिक स्रोतको URL, हामीले त्यो पृष्ठ हेरेको मिति र प्रत्येक दाबीको आधार (आधिकारिक/अनुमानित/प्रमाणित छैन) उल्लेख गरिएको हुन्छ।',
    answerEn:
      'Every service page lists the official source URL, the date we read that page, and the basis of each claim (officially stated, estimated, or not verified).',
    basis: ClaimBasis.OFFICIALLY_STATED,
    sourceUrl: null,
  },
  {
    order: 3,
    questionNe: 'दस्तुर वा कागजात फरक भेटिएमा के गर्ने?',
    questionEn: 'What if I find a different fee or document requirement?',
    answerNe:
      'सम्बन्धित सेवा पृष्ठको “यो जानकारी गलत/पुरानो छ?” बटन थिचेर जनाउनुहोस्। हामी आधिकारिक स्रोतसँग पुन: मिलाएर हेर्छौं। कृपया व्यक्तिगत परिचयपत्र नम्बर नलेख्नुहोस्।',
    answerEn:
      'Use the "Is this information wrong or out of date?" button on that service page. We re-check it against the official source. Please do not include personal ID numbers.',
    basis: ClaimBasis.OFFICIALLY_STATED,
    sourceUrl: null,
  },
  {
    order: 4,
    questionNe: 'के तपाईंहरूले मेरो कागजात राख्नुहुन्छ?',
    questionEn: 'Do you store my documents?',
    answerNe:
      'हुँदैन। कागजात अपलोड गर्ने सुविधा छैन, र हामी नागरिकता, राहदानी वा राष्ट्रिय परिचयपत्र नम्बर संकलन गर्दैनौं।',
    answerEn:
      'No. There is no document upload, and we do not collect citizenship, passport or national ID numbers.',
    basis: ClaimBasis.OFFICIALLY_STATED,
    sourceUrl: null,
  },
]
