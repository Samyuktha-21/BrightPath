// Single source of truth for exam data.
// Used both by the DB seed script (server/seed/seedExams.js) and as the
// in-memory fallback in the exams route (server/routes/exams.js).
//
// Dates verified against official sources / latest notifications as of June 2026.
// `isTentative: true` means the date is NOT yet officially announced and is the
// expected window based on the conducting body's past cycles — show it as provisional.

const placeholderNotes = [{ title: 'Sets, Relations and Functions', link: 'materials/notes.png', type: 'Notes' }];

const sampleExams = [
    // ---------------- Medical ----------------
    {
        name: 'NEET UG 2027', category: 'Medical', conductingBody: 'NTA',
        examDate: new Date('2027-05-02'),
        registrationDates: { start: new Date('2027-02-01'), end: new Date('2027-03-07') },
        examLevel: 'National', websiteUrl: 'https://neet.nta.nic.in/',
        description: 'National Eligibility cum Entrance Test for MBBS/BDS courses.',
        materials: placeholderNotes, isTentative: true
    },
    {
        name: 'NEET PG 2026', category: 'Medical', conductingBody: 'NBEMS',
        examDate: new Date('2026-08-30'),
        registrationDates: { start: new Date('2026-07-01'), end: new Date('2026-07-21') },
        examLevel: 'National', websiteUrl: 'https://nbe.edu.in/',
        description: 'Eligibility-cum-ranking examination for Post Graduate Medical courses. Date officially scheduled by NBEMS.',
        materials: placeholderNotes, isTentative: false
    },
    {
        name: 'AIIMS INI-CET (Jan 2027 Session)', category: 'Medical', conductingBody: 'AIIMS New Delhi',
        examDate: new Date('2026-11-08'),
        registrationDates: { start: new Date('2026-09-01'), end: new Date('2026-10-10') },
        examLevel: 'National', websiteUrl: 'https://www.aiimsexams.ac.in/',
        description: 'Institute of National Importance Combined Entrance Test (January 2027 admission session).',
        materials: placeholderNotes, isTentative: true
    },

    // ---------------- Engineering ----------------
    {
        name: 'JEE Main 2027 (Session 1)', category: 'Engineering', conductingBody: 'NTA',
        examDate: new Date('2027-01-24'),
        registrationDates: { start: new Date('2026-11-01'), end: new Date('2026-11-30') },
        examLevel: 'National', websiteUrl: 'https://jeemain.nta.ac.in/',
        description: 'Joint Entrance Examination Main for NITs, IIITs and GFTIs.',
        materials: placeholderNotes, isTentative: true
    },
    {
        name: 'JEE Advanced 2027', category: 'Engineering', conductingBody: 'IITs',
        examDate: new Date('2027-05-16'),
        registrationDates: { start: new Date('2027-04-30'), end: new Date('2027-05-07') },
        examLevel: 'National', websiteUrl: 'https://jeeadv.ac.in/',
        description: 'Entrance exam for Indian Institutes of Technology (IITs).',
        materials: placeholderNotes, isTentative: true
    },
    {
        name: 'GATE 2027', category: 'Engineering', conductingBody: 'IIT Madras',
        examDate: new Date('2027-02-06'),
        registrationDates: { start: new Date('2026-08-28'), end: new Date('2026-09-30') },
        examLevel: 'National', websiteUrl: 'https://gate.iitm.ac.in/',
        description: 'Graduate Aptitude Test in Engineering — for M.Tech admissions and PSU recruitment. Conducted by IIT Madras for 2027.',
        materials: [], isTentative: true
    },
    {
        name: 'BITSAT 2027', category: 'Engineering', conductingBody: 'BITS Pilani',
        examDate: new Date('2027-05-20'),
        registrationDates: { start: new Date('2027-01-15'), end: new Date('2027-04-10') },
        examLevel: 'University', websiteUrl: 'https://www.bitsadmission.com/',
        description: 'BITS Pilani Admission Test.',
        materials: placeholderNotes, isTentative: true
    },
    {
        name: 'VITEEE 2027', category: 'Engineering', conductingBody: 'VIT',
        examDate: new Date('2027-04-19'),
        registrationDates: { start: new Date('2026-11-01'), end: new Date('2027-03-31') },
        examLevel: 'University', websiteUrl: 'https://viteee.vit.ac.in/',
        description: 'VIT Engineering Entrance Examination.',
        materials: placeholderNotes, isTentative: true
    },
    {
        name: 'SRMJEEE 2027', category: 'Engineering', conductingBody: 'SRM IST',
        examDate: new Date('2027-04-15'),
        registrationDates: { start: new Date('2026-11-15'), end: new Date('2027-04-05') },
        examLevel: 'University', websiteUrl: 'https://www.srmist.edu.in/',
        description: 'SRM Joint Engineering Entrance Examination.',
        materials: placeholderNotes, isTentative: true
    },

    // ---------------- University ----------------
    {
        name: 'CUET UG 2027', category: 'University', conductingBody: 'NTA',
        examDate: new Date('2027-05-15'),
        registrationDates: { start: new Date('2027-02-09'), end: new Date('2027-03-30') },
        examLevel: 'National', websiteUrl: 'https://cuet.samarth.ac.in/',
        description: 'Common University Entrance Test for Central Universities.',
        materials: placeholderNotes, isTentative: true
    },

    // ---------------- Government ----------------
    {
        name: 'UPSC CSE Prelims 2027', category: 'Government', conductingBody: 'UPSC',
        examDate: new Date('2027-05-23'),
        registrationDates: { start: new Date('2027-02-01'), end: new Date('2027-02-21') },
        examLevel: 'National', websiteUrl: 'https://upsc.gov.in/',
        description: 'Civil Services Examination for IAS, IPS, IFS etc.',
        materials: placeholderNotes, isTentative: true
    },
    {
        name: 'SSC CGL 2026', category: 'Government', conductingBody: 'SSC',
        examDate: new Date('2026-09-12'),
        registrationDates: { start: new Date('2026-05-21'), end: new Date('2026-06-25') },
        examLevel: 'National', websiteUrl: 'https://ssc.gov.in/',
        description: 'Combined Graduate Level Examination (Tier 1) for Group B and C posts. Notification out for 12,256 vacancies; exact Tier-1 date within the Aug–Sep 2026 window.',
        materials: placeholderNotes, isTentative: true
    },
    {
        name: 'UPSC NDA II 2026', category: 'Government', conductingBody: 'UPSC',
        examDate: new Date('2026-09-13'),
        registrationDates: { start: new Date('2026-05-20'), end: new Date('2026-06-11') },
        examLevel: 'National', websiteUrl: 'https://upsc.gov.in/',
        description: 'National Defence Academy & Naval Academy Examination (II) for Army, Navy and Air Force wings. Officially scheduled by UPSC.',
        materials: [], isTentative: false
    },

    // ---------------- Management ----------------
    {
        name: 'CAT 2026', category: 'Management', conductingBody: 'IIMs',
        examDate: new Date('2026-11-29'),
        registrationDates: { start: new Date('2026-08-01'), end: new Date('2026-09-20') },
        examLevel: 'National', websiteUrl: 'https://iimcat.ac.in/',
        description: 'Common Admission Test for MBA admissions (expected to be conducted by IIM Indore).',
        materials: placeholderNotes, isTentative: true
    },
    {
        name: 'XAT 2027', category: 'Management', conductingBody: 'XLRI',
        examDate: new Date('2027-01-03'),
        registrationDates: { start: new Date('2026-07-10'), end: new Date('2026-12-05') },
        examLevel: 'National', websiteUrl: 'https://xatonline.in/',
        description: 'Xavier Aptitude Test for management programs.',
        materials: placeholderNotes, isTentative: true
    },
    {
        name: 'SNAP 2026', category: 'Management', conductingBody: 'Symbiosis International',
        examDate: new Date('2026-12-06'),
        registrationDates: { start: new Date('2026-08-01'), end: new Date('2026-11-15') },
        examLevel: 'University', websiteUrl: 'https://www.snaptest.org/',
        description: 'Symbiosis National Aptitude Test for MBA admissions to Symbiosis institutes. First of three test dates (06, 14 & 20 Dec 2026).',
        materials: [], isTentative: true
    },

    // ---------------- Law ----------------
    {
        name: 'CLAT 2027', category: 'Law', conductingBody: 'Consortium of NLUs',
        examDate: new Date('2026-12-06'),
        registrationDates: { start: new Date('2026-08-01'), end: new Date('2026-10-31') },
        examLevel: 'National', websiteUrl: 'https://consortiumofnlus.ac.in/',
        description: 'Common Law Admission Test for NLUs. Consortium has confirmed registration opens August 2026.',
        materials: placeholderNotes, isTentative: true
    },

    // ---------------- Design ----------------
    {
        name: 'NIFT 2027', category: 'Design', conductingBody: 'NTA',
        examDate: new Date('2027-02-07'),
        registrationDates: { start: new Date('2026-12-01'), end: new Date('2026-12-31') },
        examLevel: 'National', websiteUrl: 'https://nift.ac.in/',
        description: 'National Institute of Fashion Technology Entrance Exam.',
        materials: placeholderNotes, isTentative: true
    }
];

module.exports = sampleExams;
