
import { BrandProfile, PageType } from './types';

export const BRAND_PROFILES: BrandProfile[] = [
  {
    id: 'ei',
    name: 'Emirates Islamic',
    legalName: 'Emirates Islamic Bank PJSC',
    orgType: 'BankOrCreditUnion',
    domain: 'www.emiratesislamic.ae',
    logoUrl: 'https://www.emiratesislamic.ae/-/media/ei/images/header/emirates-islamic-logo.svg',
    address: ['Executive Office Building - G Floor, Building 16 - Dubai Healthcare City, Dubai, 6564, AE'],
    contactPoints: [{ type: 'Customer Service', value: '+971 600 599 995' }],
    sameAs: [
      'https://www.facebook.com/emiratesislamic',
      'https://twitter.com/emiratesislamic',
      'https://www.linkedin.com/company/emirates-islamic-bank/',
      'https://www.instagram.com/emiratesislamic',
      'https://www.youtube.com/channel/UCdrZqwAbeRNTTkDhZcuNQ3Q'
    ],
    primaryColor: '#461e57',
    accentColor: '#51c8bc',
    surfaceColor: '#f3f4f6'
  },
  {
    id: 'enbd',
    name: 'Emirates NBD',
    legalName: 'Emirates NBD Bank PJSC',
    orgType: 'BankOrCreditUnion',
    domain: 'www.emiratesnbd.com',
    logoUrl: 'https://www.emiratesnbd.com/en/assets/images/logo.png',
    address: ['Baniyas Road, Deira, Dubai, UAE'],
    contactPoints: [{ type: 'Customer Service', value: '+971 600 54 0000' }],
    sameAs: [
      'https://www.facebook.com/EmiratesNBD',
      'https://twitter.com/EmiratesNBD',
      'https://www.linkedin.com/company/emirates-nbd'
    ],
    primaryColor: '#072447',
    accentColor: '#2765ff',
    surfaceColor: '#f0f7ff'
  }
];

export const PAGE_TYPES = Object.values(PageType);
