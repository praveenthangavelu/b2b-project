export const EF_FIELDS = [
  { id: 'email',     icon: '✉️', label: 'Email Address', desc: 'Verified business email' },
  { id: 'phone',     icon: '📞', label: 'Phone',         desc: 'Direct & mobile numbers' },
  { id: 'linkedin',  icon: '🔗', label: 'LinkedIn',      desc: 'Profile URL' },
  { id: 'title',     icon: '💼', label: 'Job Title',     desc: 'Current role' },
  { id: 'seniority', icon: '📊', label: 'Seniority',     desc: 'Level & department' },
  { id: 'location',  icon: '📍', label: 'Location',      desc: 'City & country' },
  { id: 'company',   icon: '🏢', label: 'Company',       desc: 'Company details' },
  { id: 'twitter',   icon: '🐦', label: 'Twitter',       desc: 'Social profile' },
  { id: 'revenue',   icon: '💰', label: 'Revenue',       desc: 'Est. ARR' },
  { id: 'size',      icon: '👥', label: 'Team Size',     desc: 'Employee count' },
];

export const PF_FIELDS = [
  { id: 'phone',     icon: '📞', label: 'Direct Phone', desc: 'Direct office phone' },
  { id: 'mobile',    icon: '📱', label: 'Mobile',       desc: 'Personal mobile number' },
  { id: 'email',     icon: '✉️', label: 'Email',        desc: 'Verified business email' },
  { id: 'name',      icon: '👤', label: 'Full Name',    desc: 'Contact full name' },
  { id: 'title',     icon: '💼', label: 'Job Title',    desc: 'Current role' },
  { id: 'company',   icon: '🏢', label: 'Company',      desc: 'Company name' },
  { id: 'location',  icon: '📍', label: 'Location',     desc: 'City & country' },
  { id: 'dept',      icon: '🗂️', label: 'Department',   desc: 'Team / department' },
  { id: 'seniority', icon: '📊', label: 'Seniority',    desc: 'Level & dept' },
  { id: 'hq',        icon: '🌐', label: 'HQ Country',   desc: 'Headquarters location' },
];

export const LE_FIELDS = [
  { id: 'firstname', icon: '👤', label: 'First Name', desc: 'Contact first name' },
  { id: 'lastname',  icon: '👤', label: 'Last Name',  desc: 'Contact last name' },
  { id: 'domain',    icon: '🌐', label: 'Domain',     desc: 'Company domain' },
  { id: 'phone',     icon: '📞', label: 'Phone',      desc: 'Direct & mobile numbers' },
  { id: 'email',     icon: '✉️', label: 'Email',      desc: 'Verified business email' },
  { id: 'linkedin',  icon: '🔗', label: 'LinkedIn',   desc: 'Profile URL' },
  { id: 'title',     icon: '💼', label: 'Job Title',  desc: 'Current role' },
  { id: 'company',   icon: '🏢', label: 'Company',    desc: 'Company name & info' },
  { id: 'location',  icon: '📍', label: 'Location',   desc: 'City & country' },
  { id: 'seniority', icon: '📊', label: 'Seniority',  desc: 'Level & department' },
];

export const EF_COL = { email: 'email', phone: 'phone', mobile: 'mobile', linkedin: 'linkedin', title: 'title', company: 'co', location: 'location', twitter: 'twitter', revenue: 'revenue', size: 'size', seniority: 'seniority' };
export const PF_COL = { phone: 'phone', mobile: 'mobile', email: 'email', name: 'name', title: 'title', company: 'co', location: 'location', dept: 'dept', seniority: 'seniority', hq: 'hq' };
export const LE_COL = { firstname: 'firstname', lastname: 'lastname', domain: 'domain', phone: 'phone', email: 'email', linkedin: 'linkedin', title: 'title', company: 'co', location: 'location', seniority: 'seniority' };

export const CREDITS = {
  email:    { label: 'Email Address',    cost: 1,  unit: 'email'            },
  phone:    { label: 'Phone Number',     cost: 10, unit: 'phone_number'     },
  linkedin: { label: 'LinkedIn Profile', cost: 5,  unit: 'linkedin_profile' },
  validate: { label: 'Validation',       cost: 1,  unit: 'email'            },
};

export const NAV = [
  { id: 'email',    icon: '✉️', label: 'Email Finder',        desc: 'Find email by name & domain'   },
  { id: 'phone',    icon: '📞', label: 'Phone Number Finder', desc: 'Find phone by LinkedIn URL'    },
  { id: 'linkedin', icon: '🔗', label: 'LinkedIn Enrichment', desc: 'Enrich by email or LinkedIn'   },
  { id: 'validate', icon: '☑️', label: 'Email Validation',    desc: 'Validate single or bulk emails' },
];

export const PACKAGES = [
  { id: 'p1k',  credits: 1000,  price: 5,  perK: 5.0,  tag: null },
  { id: 'p5k',  credits: 5000,  price: 20, perK: 4.0,  tag: 'Popular' },
  { id: 'p75',  credits: 7500,  price: 26, perK: 3.47, tag: null },
  { id: 'p10k', credits: 10000, price: 32, perK: 3.2,  tag: 'Best value' },
];
