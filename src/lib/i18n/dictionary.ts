import type { Locale } from './config'

/**
 * UI strings. Government/legal terminology is kept in official Nepali and
 * glossed in English rather than translated loosely — e.g. "नागरिकता प्रमाणपत्र"
 * is rendered as "Citizenship certificate (नागरिकता प्रमाणपत्र)" in English, not
 * as a paraphrase. Content strings (procedure bodies) live in the database.
 */
const dictionary = {
  ne: {
    'site.name': 'कागज के हो?',
    'site.tagline': 'सरकारी कामका लागि चाहिने कागजात र प्रक्रिया, सजिलो भाषामा',

    'nav.services': 'सेवाहरू',
    'nav.categories': 'श्रेणीहरू',
    'nav.lifeEvents': 'जीवनका घटना',
    'nav.methodology': 'तथ्य जाँच विधि',
    'nav.faq': 'प्राय: सोधिने प्रश्न',
    'nav.about': 'हाम्रोबारे',
    'nav.skipToContent': 'मुख्य सामग्रीमा जानुहोस्',

    'home.headline': 'सरकारी काम गर्न के के कागज चाहिन्छ?',
    'home.subheadline': 'आफ्नो काम छान्नुहोस्, आवश्यक कागजात र प्रक्रिया सजिलै बुझ्नुहोस्।',
    'home.searchPlaceholder': 'तपाईंलाई के काम गर्नुछ? जस्तै: Passport, Citizenship, PAN, Driving Licence…',
    'home.searchButton': 'खोज्नुहोस्',
    'home.quickCategories': 'छिटो पहुँच',
    'home.popular': 'लोकप्रिय सेवाहरू',
    'home.mostSearched': 'सबैभन्दा धेरै खोजिएका',
    'home.recentlyVerified': 'भर्खरै प्रमाणित/अद्यावधिक',
    'home.browseByLifeEvent': 'जीवनका घटना अनुसार हेर्नुहोस्',
    'home.whyTrust': 'कागज के हो? लाई किन विश्वास गर्ने?',
    'home.methodology': 'हाम्रो तथ्य-जाँच विधि',
    'home.noContentYet': 'यो खण्डमा अहिले प्रमाणित सामग्री छैन।',

    'search.title': 'खोज नतिजा',
    'search.resultsFor': 'खोज शब्द',
    'search.noResults': 'कुनै नतिजा फेला परेन।',
    'search.noResultsHelp': 'फरक शब्द प्रयोग गर्नुहोस्, वा श्रेणी अनुसार हेर्नुहोस्।',
    'search.resultCount': 'नतिजा',
    'search.emptyQuery': 'खोज्नका लागि केही टाइप गर्नुहोस्।',

    'status.verified': 'आधिकारिक स्रोतबाट प्रमाणित',
    'status.needsVerification': 'पुन: जाँच आवश्यक',
    'status.unavailable': 'जानकारी उपलब्ध छैन',
    'status.conflict': 'स्रोतहरूबीच बाझिएको जानकारी',
    'status.verified.help':
      'यस पृष्ठका सबै मुख्य विवरण आधिकारिक सरकारी स्रोतसँग मिलाएर हेरिएको हो, र अन्तिम जाँच मिति तल उल्लेख छ।',
    'status.needsVerification.help':
      'यो जानकारी आधिकारिक स्रोतबाट लिइएको हो तर पुन: जाँच गर्ने मिति नाघिसकेको छ वा केही विवरण मात्र प्रमाणित छ। कार्यालय जानुअघि आधिकारिक स्रोत हेर्नुहोस्।',
    'status.unavailable.help':
      'यस विषयमा हामीले भरपर्दो आधिकारिक स्रोत भेट्न सकेका छैनौं। तल दिइएको आधिकारिक ठेगानामा सोझै बुझ्नुहोस्।',
    'status.conflict.help':
      'आधिकारिक स्रोतहरूमा अहिले फरक-फरक जानकारी देखिन्छ। कार्यालय जानुअघि पछिल्लो सूचना हेर्नुहोस्।',
    'status.conflictBanner':
      'आधिकारिक स्रोतहरूमा अहिले फरक-फरक जानकारी देखिएको छ। कार्यालय जानुअघि पछिल्लो सूचना हेर्नुहोस्।',
    'status.legend': 'यी चिन्हहरूको अर्थ',

    'basis.OFFICIALLY_STATED': 'आधिकारिक रूपमा उल्लेखित',
    'basis.DERIVED': 'आधिकारिक विवरणबाट निकालिएको',
    'basis.ESTIMATED': 'अनुमानित',
    'basis.USER_REPORTED': 'प्रयोगकर्ताले बताएको (आधिकारिक होइन)',
    'basis.UNKNOWN': 'प्रमाणित छैन',

    'procedure.overview': 'संक्षेप',
    'procedure.eligibility': 'को-को योग्य हुन्छन्?',
    'procedure.documents': 'आवश्यक कागजातहरू',
    'procedure.steps': 'प्रक्रिया (चरण-चरण)',
    'procedure.fees': 'दस्तुर',
    'procedure.processingTime': 'लाग्ने समय',
    'procedure.whereToApply': 'कहाँ जाने / कहाँ आवेदन दिने',
    'procedure.appointment': 'समय (Appointment) लिनुपर्छ?',
    'procedure.offices': 'सम्बन्धित कार्यालय',
    'procedure.sources': 'आधिकारिक स्रोत',
    'procedure.notes': 'ध्यान दिनुपर्ने कुरा',
    'procedure.commonMistakes': 'सामान्य गल्तीहरू',
    'procedure.faq': 'प्राय: सोधिने प्रश्न',
    'procedure.checklist': 'कागजात चेकलिस्ट',
    'procedure.printChecklist': 'चेकलिस्ट प्रिन्ट / डाउनलोड',
    'procedure.lastVerified': 'अन्तिम जाँच',
    'procedure.nextReview': 'अर्को जाँच',
    'procedure.notVerified': 'प्रमाणित छैन — आधिकारिक स्रोत हेर्नुहोस्।',
    'procedure.notPublished': 'यो जानकारी अझै प्रकाशित भएको छैन।',
    'procedure.mandatory': 'अनिवार्य',
    'procedure.optional': 'आवश्यक परे मात्र',
    'procedure.openOfficialSource': 'आधिकारिक स्रोत खोल्नुहोस्',
    'procedure.relatedIn': 'यही श्रेणीका अन्य सेवा',

    'appointment.REQUIRED': 'हो — पहिले अनलाइन समय लिनुपर्छ',
    'appointment.OPTIONAL': 'लिन सकिन्छ, तर अनिवार्य होइन',
    'appointment.NOT_REQUIRED': 'पर्दैन',
    'appointment.UNKNOWN': 'प्रमाणित छैन — आधिकारिक स्रोत हेर्नुहोस्।',

    'fee.free': 'नि:शुल्क',
    'fee.notVerified': 'दस्तुर प्रमाणित छैन — आधिकारिक स्रोत हेर्नुहोस्।',
    'fee.currency': 'रु.',

    'report.trigger': 'यो जानकारी गलत/पुरानो छ?',
    'report.title': 'गलत वा पुरानो जानकारी जनाउनुहोस्',
    'report.intro':
      'तपाईंले देख्नुभएको फरक कुरा बताउनुहोस्। कृपया नागरिकता, राहदानी वा परिचयपत्र नम्बर जस्ता व्यक्तिगत विवरण नलेख्नुहोस् — हामीलाई त्यस्तो जानकारी चाहिँदैन।',
    'report.reason': 'के फरक छ?',
    'report.reason.FEE_CHANGED': 'दस्तुर परिवर्तन भयो',
    'report.reason.DOCUMENTS_CHANGED': 'कागजात परिवर्तन भयो',
    'report.reason.OFFICE_CHANGED': 'कार्यालय परिवर्तन भयो',
    'report.reason.LINK_BROKEN': 'लिंक काम गरेन',
    'report.reason.PROCESS_CHANGED': 'प्रक्रिया परिवर्तन भयो',
    'report.reason.OTHER': 'अन्य',
    'report.message': 'थप विवरण (वैकल्पिक)',
    'report.email': 'इमेल (वैकल्पिक — फर्केर सोध्नुपरे मात्र)',
    'report.submit': 'पठाउनुहोस्',
    'report.submitting': 'पठाउँदै…',
    'report.success': 'धन्यवाद! तपाईंको सूचना हामीले प्राप्त गर्‍यौं र जाँच गर्नेछौं।',
    'report.error': 'पठाउन सकिएन। कृपया फेरि प्रयास गर्नुहोस्।',
    'report.rateLimited': 'धेरै पटक पठाइयो। केही बेरपछि प्रयास गर्नुहोस्।',
    'report.privacyNote': 'हामी तपाईंको कुनै परिचयपत्र वा कागजात संकलन गर्दैनौं।',

    'source.organization': 'निकाय',
    'source.checkedAt': 'हामीले हेरेको मिति',
    'source.publishedAt': 'स्रोतमा उल्लेखित मिति',
    'source.primary': 'प्राथमिक (आधिकारिक)',
    'source.secondary': 'द्वितीय स्रोत',
    'source.none': 'यस विषयमा आधिकारिक स्रोत भेटिएको छैन।',

    'disclaimer.short':
      'कागज के हो? एक स्वतन्त्र सूचना प्लेटफर्म हो। यो सरकारी वेबसाइट होइन।',
    'disclaimer.full':
      'कागज के हो? एक स्वतन्त्र सूचना प्लेटफर्म हो। यो सरकारी वेबसाइट होइन र कुनै पनि सरकारी कार्यालयको प्रतिनिधित्व गर्दैन। आवश्यक कागजात, दस्तुर, कार्यालय र प्रक्रिया परिवर्तन हुन सक्छन्। कार्यालय जानुअघि वा कुनै रकम तिर्नुअघि आधिकारिक स्रोतबाट पुष्टि गर्नुहोस्।',

    'common.readMore': 'थप हेर्नुहोस्',
    'common.viewAll': 'सबै हेर्नुहोस्',
    'common.back': 'पछाडि',
    'common.loading': 'लोड हुँदै…',
    'common.print': 'प्रिन्ट',
    'common.share': 'सेयर',
    'common.copyLink': 'लिंक कपी गर्नुहोस्',
    'common.copied': 'कपी भयो',
    'common.language': 'भाषा',
    'common.bs': 'वि.सं.',
    'common.ad': 'ई.सं.',
    'common.notAvailable': 'उपलब्ध छैन',
    'common.sponsored': 'प्रायोजित',
    'common.error': 'केही गडबड भयो।',
    'common.notFound': 'पृष्ठ भेटिएन',
    'common.notFoundHelp': 'तपाईंले खोज्नुभएको पृष्ठ छैन वा सारिएको छ।',
    'common.goHome': 'गृहपृष्ठमा जानुहोस्',

    'footer.rights': 'सबै सामग्री स्वतन्त्र रूपमा तयार पारिएको।',
    'footer.contact': 'सम्पर्क',
    'footer.privacy': 'गोपनीयता',
    'footer.terms': 'सर्तहरू',
  },

  en: {
    'site.name': 'Kagaj K Ho?',
    'site.tagline': 'Documents and steps for government services in Nepal, in plain language',

    'nav.services': 'Services',
    'nav.categories': 'Categories',
    'nav.lifeEvents': 'Life events',
    'nav.methodology': 'Fact-check method',
    'nav.faq': 'FAQ',
    'nav.about': 'About',
    'nav.skipToContent': 'Skip to main content',

    'home.headline': 'What documents do you need for government work in Nepal?',
    'home.subheadline': 'Pick your task and see the required documents and steps, clearly explained.',
    'home.searchPlaceholder': 'What do you need to do? e.g. Passport, Citizenship, PAN, Driving Licence…',
    'home.searchButton': 'Search',
    'home.quickCategories': 'Quick access',
    'home.popular': 'Popular services',
    'home.mostSearched': 'Most searched',
    'home.recentlyVerified': 'Recently verified',
    'home.browseByLifeEvent': 'Browse by life event',
    'home.whyTrust': 'Why trust Kagaj K Ho?',
    'home.methodology': 'Our fact-check method',
    'home.noContentYet': 'No verified content in this section yet.',

    'search.title': 'Search results',
    'search.resultsFor': 'Search term',
    'search.noResults': 'No results found.',
    'search.noResultsHelp': 'Try different words, or browse by category.',
    'search.resultCount': 'results',
    'search.emptyQuery': 'Type something to search.',

    'status.verified': 'Verified from official source',
    'status.needsVerification': 'Needs verification / update',
    'status.unavailable': 'Information unavailable',
    'status.conflict': 'Official sources conflict',
    'status.verified.help':
      'Every key detail on this page was checked against an official government source. The date of the last check is shown below.',
    'status.needsVerification.help':
      'This information came from an official source but is past its review date, or only partly verified. Check the official source before visiting an office.',
    'status.unavailable.help':
      'We could not find a reliable official source for this. Please check directly with the official office linked below.',
    'status.conflict.help':
      'Official sources currently show different information. Check the latest notice before visiting.',
    'status.conflictBanner':
      'Official sources currently show conflicting information. Check the latest notice before visiting.',
    'status.legend': 'What these badges mean',

    'basis.OFFICIALLY_STATED': 'Officially stated',
    'basis.DERIVED': 'Derived from official figures',
    'basis.ESTIMATED': 'Estimated',
    'basis.USER_REPORTED': 'User-reported (not official)',
    'basis.UNKNOWN': 'Not verified',

    'procedure.overview': 'Overview',
    'procedure.eligibility': 'Who is eligible?',
    'procedure.documents': 'Required documents',
    'procedure.steps': 'Step-by-step process',
    'procedure.fees': 'Fees',
    'procedure.processingTime': 'Processing time',
    'procedure.whereToApply': 'Where to apply',
    'procedure.appointment': 'Is an appointment required?',
    'procedure.offices': 'Related offices',
    'procedure.sources': 'Official sources',
    'procedure.notes': 'Things to watch out for',
    'procedure.commonMistakes': 'Common mistakes',
    'procedure.faq': 'Frequently asked questions',
    'procedure.checklist': 'Document checklist',
    'procedure.printChecklist': 'Print / download checklist',
    'procedure.lastVerified': 'Last verified',
    'procedure.nextReview': 'Next review',
    'procedure.notVerified': 'Not verified — check the official source.',
    'procedure.notPublished': 'This information is not published yet.',
    'procedure.mandatory': 'Required',
    'procedure.optional': 'Only if applicable',
    'procedure.openOfficialSource': 'Open official source',
    'procedure.relatedIn': 'Other services in this category',

    'appointment.REQUIRED': 'Yes — book online in advance',
    'appointment.OPTIONAL': 'Available, but not required',
    'appointment.NOT_REQUIRED': 'No',
    'appointment.UNKNOWN': 'Not verified — check the official source.',

    'fee.free': 'Free of charge',
    'fee.notVerified': 'Fee not verified — check the official source.',
    'fee.currency': 'NPR',

    'report.trigger': 'Is this information wrong or out of date?',
    'report.title': 'Report outdated information',
    'report.intro':
      'Tell us what looked different. Please do not include personal details such as citizenship, passport or national ID numbers — we do not want them.',
    'report.reason': 'What is different?',
    'report.reason.FEE_CHANGED': 'Fee changed',
    'report.reason.DOCUMENTS_CHANGED': 'Documents changed',
    'report.reason.OFFICE_CHANGED': 'Office changed',
    'report.reason.LINK_BROKEN': 'Link broken',
    'report.reason.PROCESS_CHANGED': 'Process changed',
    'report.reason.OTHER': 'Other',
    'report.message': 'More detail (optional)',
    'report.email': 'Email (optional — only if we may follow up)',
    'report.submit': 'Send report',
    'report.submitting': 'Sending…',
    'report.success': 'Thank you. We received your report and will check it.',
    'report.error': 'Could not send. Please try again.',
    'report.rateLimited': 'Too many reports sent. Please try again shortly.',
    'report.privacyNote': 'We never collect your ID documents or numbers.',

    'source.organization': 'Organization',
    'source.checkedAt': 'We checked this on',
    'source.publishedAt': 'Date shown on source',
    'source.primary': 'Primary (official)',
    'source.secondary': 'Secondary source',
    'source.none': 'No official source found for this yet.',

    'disclaimer.short':
      'Kagaj K Ho? is an independent information platform. It is not a government website.',
    'disclaimer.full':
      'Kagaj K Ho? is an independent information platform. It is not a government website and does not represent any government office. Requirements, fees, office locations and procedures can change. Always confirm important details with the official source before visiting an office or making a payment.',

    'common.readMore': 'Read more',
    'common.viewAll': 'View all',
    'common.back': 'Back',
    'common.loading': 'Loading…',
    'common.print': 'Print',
    'common.share': 'Share',
    'common.copyLink': 'Copy link',
    'common.copied': 'Copied',
    'common.language': 'Language',
    'common.bs': 'BS',
    'common.ad': 'AD',
    'common.notAvailable': 'Not available',
    'common.sponsored': 'Sponsored',
    'common.error': 'Something went wrong.',
    'common.notFound': 'Page not found',
    'common.notFoundHelp': 'The page you were looking for does not exist or has moved.',
    'common.goHome': 'Go to homepage',

    'footer.rights': 'All content independently compiled.',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
  },
} as const

export type TranslationKey = keyof (typeof dictionary)['en']

export function getDictionary(locale: Locale) {
  return dictionary[locale]
}

/** Returns a translator bound to a locale. Missing keys surface loudly in dev. */
export function createTranslator(locale: Locale) {
  const table = dictionary[locale] as Record<string, string>
  const fallback = dictionary.en as Record<string, string>
  return function t(key: TranslationKey | string): string {
    const value = table[key] ?? fallback[key]
    if (value === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] missing translation key: ${key}`)
      }
      return key
    }
    return value
  }
}

export type Translator = ReturnType<typeof createTranslator>
