/**
 * Fact-checked seed content.
 *
 * RESEARCH NOTE — read before editing.
 * ------------------------------------
 * Every published record below was compiled by opening the official source
 * URL listed on it and transcribing what that page actually says. Fields the
 * source does not state are left as `null` with `ClaimBasis.UNKNOWN`, which
 * renders as "Not verified — check the official source." That is deliberate:
 * an honest gap is correct, an invented figure is not.
 *
 * In particular, note what is NOT here:
 *   - Passport fee amounts. The Department of Passports process page does not
 *     state them, and its fee pages were returning 502 at the time of
 *     verification, so no passport fee is asserted anywhere in this file.
 *   - Passport processing times, for the same reason.
 *
 * Records that could not be verified end to end are seeded as DRAFT /
 * SOURCE_ATTACHED. They are invisible to the public site and exist so an
 * editor can pick up the fact-check where the research stopped.
 *
 * All `checkedAt` / `lastVerifiedAt` values are the date the source was
 * actually read: 2026-09-05 (Asia/Kathmandu).
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

/** The date the sources below were opened and transcribed. */
export const VERIFIED_ON = new Date('2026-09-05T00:00:00+05:45')
/** Standard 90-day re-check cycle for government content. */
export const NEXT_REVIEW = new Date('2026-12-04T00:00:00+05:45')

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

export const categories = [
  { slug: 'citizenship', nameNe: 'नागरिकता', nameEn: 'Citizenship', icon: '🪪', sortOrder: 1,
    descriptionNe: 'नागरिकताको प्रमाणपत्र सम्बन्धी सेवाहरू।',
    descriptionEn: 'Services relating to the citizenship certificate.' },
  { slug: 'passport', nameNe: 'राहदानी', nameEn: 'Passport', icon: '🛂', sortOrder: 2,
    descriptionNe: 'राहदानी (पासपोर्ट) बनाउने र नवीकरण सम्बन्धी सेवाहरू।',
    descriptionEn: 'Applying for and renewing a Nepali passport.' },
  { slug: 'national-id', nameNe: 'राष्ट्रिय परिचयपत्र', nameEn: 'National ID', icon: '🆔', sortOrder: 3,
    descriptionNe: 'राष्ट्रिय परिचयपत्रको विवरण दर्ता र कार्ड सम्बन्धी सेवाहरू।',
    descriptionEn: 'National Identity Card registration and issuance.' },
  { slug: 'pan-tax', nameNe: 'PAN', nameEn: 'PAN', icon: '🧾', sortOrder: 4,
    descriptionNe: 'स्थायी लेखा नम्बर (PAN) सम्बन्धी सेवाहरू।',
    descriptionEn: 'Permanent Account Number (PAN) services.' },
  { slug: 'driving-licence', nameNe: 'सवारी चालक अनुमतिपत्र', nameEn: 'Driving Licence', icon: '🚗', sortOrder: 5,
    descriptionNe: 'सवारी चालक अनुमतिपत्र सम्बन्धी सेवाहरू।',
    descriptionEn: 'Driving licence services.' },
  { slug: 'birth-registration', nameNe: 'जन्म दर्ता', nameEn: 'Birth Registration', icon: '👶', sortOrder: 6,
    descriptionNe: 'जन्मको व्यक्तिगत घटना दर्ता।',
    descriptionEn: 'Registration of birth as a personal event.' },
  { slug: 'marriage-registration', nameNe: 'विवाह दर्ता', nameEn: 'Marriage Registration', icon: '💍', sortOrder: 7,
    descriptionNe: 'विवाहको व्यक्तिगत घटना दर्ता।',
    descriptionEn: 'Registration of marriage as a personal event.' },
  { slug: 'company-registration', nameNe: 'कम्पनी दर्ता', nameEn: 'Company Registration', icon: '🏢', sortOrder: 8,
    descriptionNe: 'कम्पनी तथा व्यवसाय दर्ता सम्बन्धी सेवाहरू।',
    descriptionEn: 'Company and business registration.' },
  { slug: 'land-property', nameNe: 'घर/जग्गा', nameEn: 'Land & Property', icon: '🏠', sortOrder: 9,
    descriptionNe: 'जग्गा तथा घर सम्बन्धी सरकारी प्रक्रिया।',
    descriptionEn: 'Land and property procedures.' },
  { slug: 'police-services', nameNe: 'प्रहरी सेवा', nameEn: 'Police Services', icon: '🚓', sortOrder: 10,
    descriptionNe: 'प्रहरी प्रतिवेदन तथा सम्बन्धित सेवाहरू।',
    descriptionEn: 'Police reports and related services.' },
  { slug: 'tax-services', nameNe: 'कर सेवा', nameEn: 'Tax Services', icon: '💰', sortOrder: 11,
    descriptionNe: 'आन्तरिक राजस्व सम्बन्धी सेवाहरू।',
    descriptionEn: 'Inland revenue services.' },
  { slug: 'social-security', nameNe: 'सामाजिक सुरक्षा', nameEn: 'Social Security', icon: '🤝', sortOrder: 12,
    descriptionNe: 'सामाजिक सुरक्षा भत्ता तथा कोष सम्बन्धी सेवाहरू।',
    descriptionEn: 'Social security allowances and funds.' },
  { slug: 'education-certificates', nameNe: 'शैक्षिक प्रमाणपत्र', nameEn: 'Education Certificates', icon: '🎓', sortOrder: 13,
    descriptionNe: 'शैक्षिक प्रमाणपत्र समकक्षता तथा प्रमाणीकरण।',
    descriptionEn: 'Equivalence and attestation of education certificates.' },
  { slug: 'foreign-employment', nameNe: 'वैदेशिक रोजगार', nameEn: 'Foreign Employment', icon: '✈️', sortOrder: 14,
    descriptionNe: 'वैदेशिक रोजगार सम्बन्धी अनुमति र प्रक्रिया।',
    descriptionEn: 'Foreign employment permits and procedures.' },
  { slug: 'other-services', nameNe: 'अन्य सरकारी सेवा', nameEn: 'Other Government Services', icon: '📋', sortOrder: 15,
    descriptionNe: 'माथिका श्रेणीमा नपर्ने अन्य सरकारी सेवाहरू।',
    descriptionEn: 'Other government services not covered above.' },
]

export const lifeEvents = [
  { slug: 'birth', nameNe: 'जन्म', nameEn: 'Birth', icon: '👶', sortOrder: 1 },
  { slug: 'citizenship', nameNe: 'नागरिकता', nameEn: 'Citizenship', icon: '🪪', sortOrder: 2 },
  { slug: 'education', nameNe: 'पढाइ', nameEn: 'Education', icon: '📚', sortOrder: 3 },
  { slug: 'employment', nameNe: 'जागिर', nameEn: 'Employment', icon: '💼', sortOrder: 4 },
  { slug: 'going-abroad', nameNe: 'विदेश जाने', nameEn: 'Going abroad', icon: '✈️', sortOrder: 5 },
  { slug: 'marriage', nameNe: 'विवाह', nameEn: 'Marriage', icon: '💍', sortOrder: 6 },
  { slug: 'business', nameNe: 'व्यवसाय', nameEn: 'Business', icon: '🏢', sortOrder: 7 },
  { slug: 'property', nameNe: 'घर/जग्गा', nameEn: 'Home & land', icon: '🏠', sortOrder: 8 },
  { slug: 'tax', nameNe: 'कर', nameEn: 'Tax', icon: '💰', sortOrder: 9 },
  { slug: 'vehicle', nameNe: 'सवारी', nameEn: 'Vehicle', icon: '🚗', sortOrder: 10 },
  { slug: 'death-inheritance', nameNe: 'मृत्यु/उत्तराधिकार', nameEn: 'Death & inheritance', icon: '🕯️', sortOrder: 11 },
]

// ---------------------------------------------------------------------------
// Reusable document definitions
// ---------------------------------------------------------------------------

export const documents = [
  {
    slug: 'passport-application-form-barcode',
    nameNe: 'बारकोड तथा QR सहितको आवेदन फारमको प्रति',
    nameEn: 'Copy of the application form with barcode and QR code',
    descriptionNe: 'अनलाइन प्रि-इनरोलमेन्ट फारम भरेपछि प्राप्त हुने बारकोड र QR कोड सहितको फारम।',
    descriptionEn: 'The form containing the barcode and QR code received after completing the online pre-enrollment form.',
  },
  {
    slug: 'citizenship-certificate-original',
    nameNe: 'नेपाली नागरिकताको सक्कल प्रमाणपत्र',
    nameEn: 'Original Nepali citizenship certificate',
    descriptionNe: 'सक्कल प्रमाणपत्र। प्रतिलिपि वा केरमेट गरिएको कागजात मान्य हुँदैन।',
    descriptionEn: 'The original certificate. Photocopies or altered documents are not accepted.',
  },
  {
    slug: 'minor-identity-card',
    nameNe: 'नाबालक परिचयपत्र',
    nameEn: 'Minor identity card',
    descriptionNe: '१६ वर्ष मुनिका आवेदकका लागि नागरिकताको सट्टामा।',
    descriptionEn: 'Used in place of a citizenship certificate for applicants under 16.',
  },
  {
    slug: 'current-or-expired-passport',
    nameNe: 'हालको वा म्याद सकिएको राहदानी',
    nameEn: 'Current or expired passport',
    descriptionNe: 'पहिले राहदानी लिइसकेको भए मात्र।',
    descriptionEn: 'Only if a passport was previously held.',
  },
  {
    slug: 'national-id-card-or-number',
    nameNe: 'राष्ट्रिय परिचयपत्र वा राष्ट्रिय परिचयपत्र नम्बर',
    nameEn: 'National Identity Card or National ID number',
    descriptionNe: null,
    descriptionEn: null,
  },
  {
    slug: 'bank-voucher-or-cash-receipt',
    nameNe: 'राजस्व बुझाएको बैंक भौचर वा नगदी रसिद',
    nameEn: 'Bank voucher or cash receipt for the revenue payment',
    descriptionNe: null,
    descriptionEn: null,
  },
  {
    slug: 'minor-card-district-verification',
    nameNe: 'नाबालक परिचयपत्रको जिल्लाबाट भएको प्रमाणीकरण',
    nameEn: 'District verification of the minor identity card',
    descriptionNe: '१६ वर्ष मुनिका आवेदकका लागि।',
    descriptionEn: 'For applicants under 16.',
  },
  {
    slug: 'parents-citizenship',
    nameNe: 'बाबु/आमा वा संरक्षकको नागरिकताको प्रमाणपत्र',
    nameEn: "Citizenship certificate of the parents or guardian",
    descriptionNe: '१६ वर्ष मुनिका आवेदकका लागि।',
    descriptionEn: 'For applicants under 16.',
  },
  {
    slug: 'proof-of-permanent-address',
    nameNe: 'हालको स्थायी ठेगाना प्रमाणित हुने कागजात',
    nameEn: 'Document proving the current permanent address',
    descriptionNe: 'नागरिकतामा उल्लेख भएको भन्दा फरक भएमा मात्र।',
    descriptionEn: 'Only if it differs from the address recorded on the citizenship certificate.',
  },
  {
    slug: 'marriage-registration-certificate',
    nameNe: 'विवाह दर्ता प्रमाणपत्र वा नाता प्रमाणित हुने कागजात',
    nameEn: 'Marriage registration certificate or proof of relationship',
    descriptionNe: 'विवाहित व्यक्तिका लागि।',
    descriptionEn: 'For married applicants.',
  },
  {
    slug: 'birth-date-document',
    nameNe: 'जन्म मिति खुल्ने आधिकारिक कागजात',
    nameEn: 'Official document showing the date of birth',
    descriptionNe: 'नागरिकतामा जन्म मिति नखुलेको अवस्थामा।',
    descriptionEn: 'When the date of birth is not shown on the citizenship certificate.',
  },
  {
    slug: 'informant-citizenship',
    nameNe: 'सूचकको नागरिकताको प्रमाणपत्र',
    nameEn: 'Citizenship certificate of the informant',
    descriptionNe: 'व्यक्तिगत घटना दर्ता गराउन आउने सूचकको नागरिकता आवश्यक पर्छ।',
    descriptionEn: "The informant registering the personal event must produce their own citizenship certificate.",
  },
  {
    slug: 'health-facility-birth-record',
    nameNe: 'स्वास्थ्य संस्थाबाट जारी जन्मको अभिलेख',
    nameEn: 'Birth record issued by the health facility',
    descriptionNe: 'स्वास्थ्य संस्थामा जन्म भएको अवस्थामा।',
    descriptionEn: 'Where the birth took place in a health facility.',
  },
]

// ---------------------------------------------------------------------------
// Offices (only officially published contact details)
// ---------------------------------------------------------------------------

export const offices = [
  {
    slug: 'department-of-passports',
    nameNe: 'राहदानी विभाग',
    nameEn: 'Department of Passports',
    organizationNe: 'परराष्ट्र मन्त्रालय, नेपाल सरकार',
    organizationEn: 'Ministry of Foreign Affairs, Government of Nepal',
    addressNe: 'त्रिपुरेश्वर, काठमाडौं',
    addressEn: 'Tripureshwor, Kathmandu',
    district: 'Kathmandu',
    province: 'Bagmati',
    phone: '+977-15970330',
    email: 'info@nepalpassport.gov.np',
    website: 'https://nepalpassport.gov.np/en',
    // Published on the Department of Passports homepage: Monday–Friday, 9 AM–5 PM.
    hours: [
      { dayOfWeek: 0, isClosed: true },
      { dayOfWeek: 1, opensAt: '09:00', closesAt: '17:00', isClosed: false },
      { dayOfWeek: 2, opensAt: '09:00', closesAt: '17:00', isClosed: false },
      { dayOfWeek: 3, opensAt: '09:00', closesAt: '17:00', isClosed: false },
      { dayOfWeek: 4, opensAt: '09:00', closesAt: '17:00', isClosed: false },
      { dayOfWeek: 5, opensAt: '09:00', closesAt: '17:00', isClosed: false },
      { dayOfWeek: 6, isClosed: true },
    ],
  },
  {
    slug: 'donidcr',
    nameNe: 'राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग',
    nameEn: 'Department of National ID and Civil Registration',
    organizationNe: 'गृह मन्त्रालय, नेपाल सरकार',
    organizationEn: 'Ministry of Home Affairs, Government of Nepal',
    addressNe: 'काठमाडौं',
    addressEn: 'Kathmandu',
    district: 'Kathmandu',
    province: 'Bagmati',
    phone: '1147',
    email: null,
    website: 'https://donidcr.gov.np/',
    hours: [],
  },
]

export type SeedSource = {
  key: string
  organization: string
  title: string
  url: string
  sourceType: SourceType
  isPrimary: boolean
  notes?: string
}

export type SeedProcedure = {
  slug: string
  categorySlug: string
  lifeEventSlugs: string[]
  titleNe: string
  titleEn: string
  summaryNe: string
  summaryEn: string
  eligibilityNe: string | null
  eligibilityEn: string | null
  whereToApplyNe: string | null
  whereToApplyEn: string | null
  notesNe: string | null
  notesEn: string | null
  processingTimeNe: string | null
  processingTimeEn: string | null
  processingTimeBasis: ClaimBasis
  appointmentRequirement: AppointmentRequirement
  appointmentNoteNe: string | null
  appointmentNoteEn: string | null
  appointmentUrl: string | null
  status: ContentStatus
  verificationStatus: VerificationStatus
  confidence: ConfidenceLevel
  metaTitleNe?: string
  metaTitleEn?: string
  metaDescriptionNe?: string
  metaDescriptionEn?: string
  aliases: string[]
  officeSlugs: Array<{ slug: string; roleNe: string | null; roleEn: string | null }>
  sources: SeedSource[]
  documents: Array<{
    slug: string
    isMandatory: boolean
    basis: ClaimBasis
    sourceKey: string | null
    conditionNe?: string | null
    conditionEn?: string | null
  }>
  steps: Array<{
    titleNe: string
    titleEn: string
    detailNe?: string | null
    detailEn?: string | null
    actionUrl?: string | null
    basis: ClaimBasis
    sourceKey: string | null
  }>
  fees: Array<{
    labelNe: string
    labelEn: string
    kind: FeeKind
    amountNpr: number | null
    amountTextNe?: string | null
    amountTextEn?: string | null
    basis: ClaimBasis
    sourceKey: string | null
  }>
  faqs: Array<{
    questionNe: string
    questionEn: string
    answerNe: string
    answerEn: string
    basis: ClaimBasis
    sourceUrl: string | null
  }>
  notices: Array<{
    level: NoticeLevel
    titleNe: string
    titleEn: string
    bodyNe: string
    bodyEn: string
    sourceUrl: string | null
  }>
}
